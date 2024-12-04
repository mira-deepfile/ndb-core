import { inject, Injectable } from "@angular/core";
import { firstValueFrom, Observable } from "rxjs";
import { ExternalProfile } from "./external-profile";
import { EntityMapperService } from "../../core/entity/entity-mapper/entity-mapper.service";
import { Entity } from "app/core/entity/model/entity";
import { EntityRegistry } from "../../core/entity/database-entity.decorator";
import { HttpClient } from "@angular/common/http";
import { catchError, map } from "rxjs/operators";
import { Logging } from "../../core/logging/logging.service";
import { EscoApiService, EscoSkillDto } from "./esco-api.service";
import { ExternalProfileLinkConfig } from "./link-external-profile/external-profile-link-config";
import { environment } from "../../../environments/environment";
import { mockSkillApi } from "./skill-api-mock";

interface UserProfileResponseDto {
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
  results: ExternalProfile[];
}

/**
 * Interaction with Aam Digital backend providing skills integration functionality.
 */
@Injectable({
  providedIn: "root",
})
export class SkillApiService {
  private readonly entityMapper: EntityMapperService =
    inject(EntityMapperService);
  private readonly entityRegistry: EntityRegistry = inject(EntityRegistry);
  private readonly escoApi: EscoApiService = inject(EscoApiService);
  private readonly http: HttpClient = inject(HttpClient);

  /**
   * Request to API with the given parameters
   * to get possibly matching external profiles.
   *
   * @param searchParams
   */
  getExternalProfiles(
    searchParams: SearchParams,
  ): Observable<UserProfileResponseDto> {
    if (!environment.production) {
      // TODO remove? for mock UI testing only
      return mockSkillApi.getExternalProfiles();
    }

    return this.http
      .get<UserProfileResponseDto>("/api/v1/skill/user-profile", {
        params: { ...searchParams },
      })
      .pipe(map((value) => value));
  }

  /**
   * Get possibly matching external profiles for the given entity,
   * generating search parameters based on the entity and config.
   *
   * @param entity
   * @param config
   */
  getExternalProfilesForEntity(
    entity: Entity,
    config: ExternalProfileLinkConfig,
  ): Observable<UserProfileResponseDto> {
    const params = this.generateDefaultSearchParams(entity, config);

    return this.getExternalProfiles(params);
  }

  generateDefaultSearchParams(
    entity: Entity,
    config: ExternalProfileLinkConfig,
  ): SearchParams {
    return {
      fullName: (config?.searchFields.fullName ?? [])
        .map((field) => entity[field])
        .filter((value) => !!value)
        .join(" "),
      email: (config?.searchFields.email ?? [])
        .map((field) => entity[field])
        .filter((value) => !!value)
        .join(" "),
      phone: (config?.searchFields.phone ?? [])
        .map((field) => entity[field])
        .filter((value) => !!value)
        .join(" "),
    };
  }

  getExternalProfileById(externalId: string): Observable<ExternalProfile> {
    if (!environment.production) {
      // TODO remove? for mock UI testing only
      return mockSkillApi.getExternalProfileById(externalId);
    }

    return this.http.get<ExternalProfile>(
      "/api/v1/skill/user-profile/" + externalId,
    );
  }

  async getSkillsFromExternalProfile(externalId: string): Promise<string[]> {
    const profile = await firstValueFrom(
      this.getExternalProfileById(externalId),
    );

    const skills: Entity[] = [];
    for (const extSkill of profile.skills) {
      const skill = await this.loadOrCreateSkill(extSkill.escoUri);
      skills.push(skill);
    }

    return skills.map((s) => s.getId());
  }

  private async loadOrCreateSkill(escoUri: string): Promise<Entity> {
    let entity = await this.entityMapper.load("Skill", escoUri).catch((e) => {
      if (e.status === 404) {
        return undefined;
      } else {
        throw e;
      }
    });

    if (!entity) {
      let escoDto: EscoSkillDto = await firstValueFrom(
        this.escoApi.getEscoSkill(escoUri).pipe(
          catchError((err, caught) => {
            Logging.error(err);
            // todo error handling?
            return caught;
          }),
        ),
      );

      const ctor = this.entityRegistry.get("Skill");
      // TODO: load actual esco skill details from API
      entity = Object.assign(new ctor(escoUri), {
        escoUri: escoUri,
        name: escoDto.title,
        description: escoDto.description["en"].literal, // todo use current language and fallback to en
      });
      await this.entityMapper.save(entity);
    }

    return entity;
  }
}

export interface SearchParams {
  fullName?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
}