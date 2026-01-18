import { Form, Rating } from "@douyinfe/semi-ui";
import { RatingProps } from "@douyinfe/semi-ui/lib/es/rating";
import { SchemaColumnBase, SchemaDefined } from "../../typing";

export const rating = {
  render: (props) => <Rating disabled {...props} />,
  renderForm: (props) => <Form.Rating {...props} />,
} as SchemaDefined;

export type RatingColumn = SchemaColumnBase<"rating", RatingProps>;
