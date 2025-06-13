import Form from "../../ui/Form";
import FormRow from "../../ui/FormRow";
import Input from "../../ui/Input";
import useSetting from "./useSetting";
import Spinner from "./../../ui/Spinner";
import { useForm } from "react-hook-form";
import Button from "../../ui/Button";
import { useUpdateSetting } from "./useUpdateSetting";
import { useEffect } from "react";

function UpdateSettingsForm() {
  const {
    isLoading,
    error,
    settings: {
      minBookingLength,
      maxBookingLength,
      maxGuestsPerBooking,
      breakfastPrice,
    } = {},
  } = useSetting();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      minBookingLength,
      maxBookingLength,
      maxGuestsPerBooking,
      breakfastPrice,
    },
  });

  const { updateSetting, isUpdating } = useUpdateSetting();

  // Reset form when settings change
  useEffect(() => {
    reset({
      minBookingLength,
      maxBookingLength,
      maxGuestsPerBooking,
      breakfastPrice,
    });
  }, [minBookingLength, maxBookingLength, maxGuestsPerBooking, breakfastPrice, reset]);

  function onSubmit(data) {
    updateSetting(data, {
      onSuccess: () => {
        reset(data); // Reset form with new values after successful update
      },
    });
  }

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow label="Minimum nights/booking">
        <Input
          type="number"
          id="minBookingLength"
          disabled={isUpdating}
          {...register("minBookingLength", {
            required: "This field is required",
          })}
        />
      </FormRow>
      <FormRow label="Maximum nights/booking">
        <Input
          type="number"
          id="maxBookingLength"
          disabled={isUpdating}
          {...register("maxBookingLength", {
            required: "This field is required",
          })}
        />
      </FormRow>
      <FormRow label="Maximum guests/booking">
        <Input
          type="number"
          id="maxGuestsPerBooking"
          disabled={isUpdating}
          {...register("maxGuestsPerBooking", {
            required: "This field is required",
          })}
        />
      </FormRow>
      <FormRow label="Breakfast price">
        <Input
          type="number"
          id="breakfastPrice"
          disabled={isUpdating}
          {...register("breakfastPrice", {
            required: "This field is required",
          })}
        />
      </FormRow>
      <FormRow>
        <Button type="reset" variation="secondary" onClick={() => reset()}>
          Cancel
        </Button>
        <Button disabled={isUpdating}>Update settings</Button>
      </FormRow>
    </Form>
  );
}

export default UpdateSettingsForm;
