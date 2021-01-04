import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import {
  CONFIGURABLE_ENUM_CONFIG_PREFIX,
  ConfigurableEnum,
} from "../configurable-enum.interface";
import { ConfigService } from "../../config/config.service";

/**
 * Enumerate over all {@link ConfigurableEnum} value for the given enum config id.
 *
 * Works similar to `*ngFor`:
 * `<div *appConfigurableEnum="let item of 'interaction-type'"></div>`
 * will create one div for each option defined in the config for "enum:interaction-type".
 */
@Directive({
  selector: "[appConfigurableEnum]",
})
export class ConfigurableEnumDirective {
  /**
   * Sets the string id of the enum config id.
   * @param enumConfigId
   */
  @Input() set appConfigurableEnumOf(enumConfigId: string) {
    const options = this.configService.getConfig<ConfigurableEnum>(
      CONFIGURABLE_ENUM_CONFIG_PREFIX + enumConfigId
    );
    for (const item of options) {
      this.viewContainerRef.createEmbeddedView(this.templateRef, {
        $implicit: item,
      });
    }
  }

  /**
   * For implementation details see
   * https://www.talkinghightech.com/en/create-ngfor-directive/ and
   * https://angular.io/guide/structural-directives#write-a-structural-directive
   *
   * @param templateRef
   * @param viewContainerRef
   * @param configService
   */
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private configService: ConfigService
  ) {}
}
