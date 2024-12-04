import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from "@angular/core";
import { MatButton } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import {
  LinkExternalProfileDialogComponent,
  LinkExternalProfileDialogData,
} from "./link-external-profile-dialog/link-external-profile-dialog.component";
import { ExternalProfile } from "../external-profile";
import { EditComponent } from "../../../core/entity/default-datatype/edit-component";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { MatTooltip } from "@angular/material/tooltip";
import { SkillApiService } from "../skill-api.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ExternalProfileLinkConfig } from "./external-profile-link-config";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";

@Component({
  selector: "app-edit-external-profile-link",
  standalone: true,
  imports: [
    MatButton,
    FaIconComponent,
    MatTooltip,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./edit-external-profile-link.component.html",
  styleUrl: "./edit-external-profile-link.component.scss",
})
export class EditExternalProfileLinkComponent
  extends EditComponent<string>
  implements OnInit
{
  /**
   * The configuration details for this external profile link,
   * defined in the config field's `additional` property.
   */
  declare additional: ExternalProfileLinkConfig;

  isLoading: WritableSignal<boolean> = signal(false);
  externalProfile: ExternalProfile | undefined;

  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly skillApi: SkillApiService = inject(SkillApiService);

  override ngOnInit() {
    super.ngOnInit();

    if (this.formControl.value) {
      this.skillApi
        .getExternalProfileById(this.formControl.value)
        .subscribe((profile) => {
          this.externalProfile = profile;
        });
    }
  }

  async searchMatchingProfiles() {
    const currentEntity = Object.assign(
      {},
      this.entity,
      this.parent.getRawValue(),
    );

    this.dialog
      .open(LinkExternalProfileDialogComponent, {
        data: {
          entity: currentEntity,
          config: this.additional,
        } as LinkExternalProfileDialogData,
      })
      .afterClosed()
      .subscribe((result: ExternalProfile | undefined) => {
        if (result) {
          this.linkProfile(result);
        }
      });
  }

  unlinkExternalProfile() {
    this.externalProfile = undefined;
    this.formControl.setValue(null);
    this.formControl.markAsDirty();
  }

  async updateExternalData() {
    this.isLoading.set(true);

    if (!this.formControl.value) {
      return;
    }

    const skills = await this.skillApi.getSkillsFromExternalProfile(
      this.formControl.value,
    );

    // TODO: run import / update automatically?
    const targetFormControl = this.parent.get("skills");
    targetFormControl?.setValue(skills);
    targetFormControl.markAsDirty();

    this.isLoading.set(false);
  }

  private linkProfile(externalProfile: ExternalProfile) {
    this.externalProfile = externalProfile;
    this.formControl.setValue(externalProfile.id);
    this.formControl.markAsDirty();
  }
}