import { Formik, Form as FormikForm, useField } from "formik";
import { FC } from "react";
import { v4 as uuid } from "uuid";
import * as yup from "yup";

import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  TextField,
  TextFieldProps,
} from "@material-ui/core";
import { Add } from "@material-ui/icons";

import { useStyles } from "../Kanban";

export const FormTextField: FC<TextFieldProps & { name: string }> = ({
  name,
  ...props
}) => {
  const [field, { error, touched }] = useField(name);
  const hasError = Boolean(error) && touched;
  return (
    <TextField
      label={props.label ?? name}
      type="text"
      variant={"outlined"}
      error={hasError}
      helperText={hasError && error}
      fullWidth
      {...props}
      {...field}
    />
  );
};

export const FormSelect: FC<SelectProps & { name: string; options: number[] }> =
  ({ name, options, ...props }) => {
    const [field, { error, touched }] = useField(name);
    const hasError = Boolean(error) && touched;
    return (
      <FormControl fullWidth>
        <InputLabel>{props.label ?? name}</InputLabel>
        <Select
          label={props.label ?? name}
          error={hasError}
          variant={"outlined"}
          {...props}
          {...field}
        >
          {options.map((item) => (
            <MenuItem value={item}>{item}</MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };
export type FormData = {
  id: string;
  label: string;
  storyPointsEstimation: number;
};

const initialValues = {
  id: uuid(),
  label: "",
  storyPointsEstimation: 0.25,
};

interface Props {
  handleAdd: (data: FormData) => void;
}

const Form: FC<Props> = ({ handleAdd }) => {
  const classes = useStyles();

  const validationSchema = yup.object().shape({
    id: yup.string().required("required").typeError("required"),
    label: yup.string().required("required").typeError("required"),
    storyPointsEstimation: yup
      .number()
      .required("required")
      .typeError("required"),
  });

  return (
    <Formik
      onSubmit={handleAdd}
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(formikBag) => {
        formikBag.isSubmitting && formikBag.setSubmitting(false);

        return (
          <FormikForm noValidate>
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justifyContent="center"
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormTextField name="label" />
                </Grid>
                <Grid item xs={12}>
                  <FormSelect
                    name="storyPointsEstimation"
                    options={[0.25, 0.5, 0.75, 1, 1.5, 2, 4, 5]}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type={"submit"} variant={"outlined"} color="primary">
                    <Add className={classes.leftIcon} />
                    ADD
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </FormikForm>
        );
      }}
    </Formik>
  );
};

export default Form;
