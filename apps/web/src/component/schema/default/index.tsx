import "react";
import { ActionProps, SchemaColumnBase, SchemaDefined } from "../typing";
import { ArrayColunm, array } from "./array";
import { AttachmenntColumn, attachment } from "./attachment";
import { AutoCompleteColumn, autoComplete } from "./auto-complete";
import { CascaderColunm, cascader } from "./cascader";
import { CheckboxColumn, checkbox } from "./checkbox";
import { CheckboxGroupColumn, checkboxGroup } from "./checkbox-group";
import { ColorColumn, color } from "./color";
import { complexArray } from "./complex-array";
import { DateTimeColunm, datetime } from "./datetime";
import { DisplayColumn, display } from "./display";
import { DSlateColumn, dslate } from "./dslate";
import { FastIndexColumn, fastIndex } from "./fast/index";
import { FastRadioColumn, fastRadio } from "./fast/radio";
import { FastSelectColumn, fastSelect } from "./fast/select";
import { FastSwitchColumn, fastSwitch } from "./fast/switch";
import { FileColumn, file } from "./file";
import { GroupColumn, group } from "./group";
import { GroupSelectColumn, groupSelect } from "./group-select";
import { IdColumn, id } from "./id";
import { IdcardColumn, idcard } from "./idcard";
import { ImgColumn, img } from "./img/img";
import { InputColumn, input } from "./input";
import { InputGroupColumn, inputGroup } from "./input-group";
import { MoneyColumn, money } from "./money";
import { NumberColumn, number } from "./number";
import { PolygonColumn, polygon } from "./polygon";
import { PositionColumn, position } from "./position";
import { RadioColumn, radio } from "./radio";
import { RatingColumn, rating } from "./rating";
import { RemotePickerColumn, remotePicker } from "./remote-picker";
import { SectionColumn, section } from "./section";
import { SelectColumn, select } from "./select";
import { SliderColumn, slider } from "./slider";
import { StatusColumn, status } from "./status";
import { StockColumn, stock } from "./stock";
import { SwitchColumn, _switch } from "./switch";
import { TabsColumn, tabs } from "./tabs";
import { TagInputColumn, tagInput } from "./tag-input";
import { TelColumn, tel } from "./tel";
import { TextareaColumn, textarea } from "./textarea";
import { TimeColunm, time } from "./time";
import { TreeColumn, tree } from "./tree";
import { TreeSelectColumn, treeSelect } from "./tree-select";

export const defaultColumn = {
  section,
  input,
  switch: _switch,
  datetime,
  select,
  id,
  number,
  money,
  group,
  textarea,
  checkbox,
  radio,
  slider,
  time,
  cascader,
  rating,
  array,
  img,
  dslate,
  status,
  position,
  tel,
  idcard,
  file,
  tree,
  tabs,
  color,
  display,
  polygon,
  attachment,
  stock,
  ["complex-array"]: complexArray,
  ["tree-select"]: treeSelect,
  ["group-select"]: groupSelect,
  ["checkbox-group"]: checkboxGroup,
  ["auto-complete"]: autoComplete,
  ["tag-input"]: tagInput,
  ["fast-radio"]: fastRadio,
  ["fast-switch"]: fastSwitch,
  ["fast-index"]: fastIndex,
  ["fast-select"]: fastSelect,
  ["remote-picker"]: remotePicker,
  ["input-group"]: inputGroup,
} as Record<string, SchemaDefined>;

export type DefaultSchemaColumn =
  | InputColumn
  | SwitchColumn
  | TreeColumn
  | TreeSelectColumn
  | TabsColumn
  | DateTimeColunm
  | SectionColumn
  | SelectColumn
  | NumberColumn
  | MoneyColumn
  | StockColumn
  | IdColumn
  | GroupColumn
  | TextareaColumn
  | CheckboxColumn
  | RadioColumn
  | SliderColumn
  | TimeColunm
  | CascaderColunm
  | RatingColumn
  | AutoCompleteColumn
  | TagInputColumn
  | ArrayColunm
  | ImgColumn
  | DSlateColumn
  | StatusColumn
  | PositionColumn
  | FastIndexColumn
  | FastSwitchColumn
  | FastRadioColumn
  | FastSelectColumn
  | TelColumn
  | IdcardColumn
  | FileColumn
  | GroupSelectColumn
  | ColorColumn
  | RemotePickerColumn
  | CheckboxGroupColumn
  | DisplayColumn
  | CheckboxGroupColumn
  | DisplayColumn
  | PolygonColumn
  | AttachmenntColumn
  | InputGroupColumn
  | SchemaColumnBase<"action", ActionProps>;
