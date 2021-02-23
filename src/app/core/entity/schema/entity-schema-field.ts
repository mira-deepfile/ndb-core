/*
 *     This file is part of ndb-core.
 *
 *     ndb-core is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     ndb-core is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with ndb-core.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Interface for additional configuration about a DatabaseField schema.
 *
 * This is used as parameter for the DatabaseField annotation:
 *
 * `@DatabaseField(fieldConfig: EntitySchemaField)`
 */
export interface EntitySchemaField {
  /**
   * The datatype of this field. This will trigger to matching datatype transformer when saving/loading the entity.
   *
   * If you don't set this explicitly, the dataType is inferred from the TypeScript type of the property that is annotated.
   */
  dataType?: string;

  /**
   * In case of a map or array field (e.g. dataType==='array') define the datatype of the values contained in the array.
   *
   * see {@link /miscellaneous/variables.html#arrayEntitySchemaDatatype},
   * {@link /miscellaneous/variables.html#mapEntitySchemaDatatype}
   */
  innerDataType?: string;

  /**
   * Set to true to make the framework automatically create an index to retrieve/filter Entities quickly based on this field
   *
   * @todo not implemented yet
   */
  generateIndex?: boolean; // TODO: implement index support in EntitySchema

  /**
   * Whether the field should be initialized with a default value if undefined
   * (which is then run through dataType transformation);
   */
  defaultValue?: any;

  /**
   * (Optional) Assign any custom "extension" configuration you need for a specific datatype extension.
   *
   * You can pass any kind of value here to allow complex custom datytypes' transformations
   * that are not part of the core datatypes and therefore not included in this core interface.
   */
  ext?: any;
}
