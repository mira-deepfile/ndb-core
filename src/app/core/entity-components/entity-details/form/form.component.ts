import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { FormFieldConfig } from "./FormConfig";
import { PanelConfig } from "../EntityDetailsConfig";
import { Entity } from "../../../entity/entity";
import { EntityMapperService } from "../../../entity/entity-mapper.service";
import { SessionService } from "../../../session/session-service/session.service";
import { ChildPhotoService } from "../../../../child-dev-project/children/child-photo-service/child-photo.service";
import { AlertService } from "../../../alerts/alert.service";
import { OnInitDynamicComponent } from "../../../view/dynamic-components/on-init-dynamic-component.interface";
import { getParentUrl } from "../../../../utils/utils";
import { Child } from "../../../../child-dev-project/children/model/child";

/**
 * This component creates a form based on the passed config.
 * It creates a flexible layout and includes validation functionality.
 */
@Component({
  selector: "app-form",
  templateUrl: "./form.component.html",
  styleUrls: ["./form.component.scss"],
})
export class FormComponent implements OnInitDynamicComponent {
  entity: Entity;

  creatingNew = false;
  isAdminUser: boolean;
  enablePhotoUpload = false;

  editing: boolean = false;
  form: FormGroup;
  validateForm: boolean = false;
  config;

  constructor(
    private fb: FormBuilder,
    private entityMapperService: EntityMapperService,
    private alertService: AlertService,
    private childPhotoService: ChildPhotoService,
    private router: Router,
    private sessionService: SessionService
  ) {
    this.isAdminUser = this.sessionService.getCurrentUser().admin;
  }

  onInitFromDynamicConfig(config: PanelConfig) {
    this.entity = config.entity;
    this.config = config.config;
    this.initForm();
    if (config.creatingNew) {
      this.creatingNew = true;
      this.switchEdit();
    }
  }

  switchEdit() {
    this.editing = !this.editing;
    this.initForm();
    this.enablePhotoUpload = this.childPhotoService.canSetImage();
  }

  async save(): Promise<Entity> {
    this.checkFormValidity();
    this.assignFormValuesToEntity(this.entity, this.form);
    try {
      await this.entityMapperService.save<Entity>(this.entity);
      this.router.navigate([getParentUrl(this.router), this.entity.getId()]);
      this.alertService.addInfo("Saving Successful");
      this.switchEdit();
      return this.entity;
    } catch (err) {
      this.alertService.addDanger(
        'Could not save "' +
          this.entity.getConstructor().ENTITY_TYPE +
          '": ' +
          err
      );
      throw new Error(err);
    }
  }

  /**
   * hands over the selected file to the cloudFileService together with the childId
   * @param event The event of the file upload dialog
   */
  async uploadChildPhoto(event) {
    await this.childPhotoService.setImage(
      event.target.files[0],
      this.entity.entityId
    );
    // Photo does so far only work on the child entity
    const child: Child = this.entity as Child;
    child.photo.next(await this.childPhotoService.getImage(child));
  }

  private buildFormConfig() {
    const formConfig = {};
    this.config.cols.forEach((c: FormFieldConfig[]) =>
      c.forEach((r) => {
        formConfig[r.id] = [
          { value: this.entity[r.id], disabled: !this.editing },
        ];
        if (r.required) {
          formConfig[r.id].push(Validators.required);
        }
      })
    );
    return formConfig;
  }

  private assignFormValuesToEntity(entity: Entity, form: FormGroup) {
    Object.keys(form.controls).forEach((key) => {
      const value = form.get(key).value;
      if (value !== null) {
        entity[key] = value;
      }
    });
  }

  private initForm(): void {
    this.form = this.fb.group(this.buildFormConfig());
  }

  private checkFormValidity() {
    // errors regarding invalid fields wont be displayed unless marked as touched
    this.form.markAllAsTouched();
    this.validateForm = true;
    if (!this.form.valid) {
      const invalidFields = this.getInvalidFields();
      this.alertService.addDanger(
        "Form invalid, required fields (" + invalidFields + ") missing"
      );
      throw new Error(
        "Form invalid, required fields(" + invalidFields + ") missing"
      );
    }
  }

  private getInvalidFields() {
    const invalid = [];
    const controls = this.form.controls;
    for (const field in controls) {
      if (controls[field].invalid) {
        invalid.push(field);
      }
    }
    return invalid;
  }
}