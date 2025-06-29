import Input from "../../ui/Input";
import Form from "../../ui/Form";
import Button from "../../ui/Button";
import FileInput from "../../ui/FileInput";
import Textarea from "../../ui/Textarea";
import { useForm } from "react-hook-form";
import FormRow from "../../ui/FormRow";
import useCreateCabin from "./useCreateCabin";
import useEditCabin from "./useEditCabin";
import { toast } from "react-hot-toast";
function CreateCabinForm({ cabinToEdit = {}, onCloseModel }) {
  const { id: editId, ...editValues } = cabinToEdit;
  const isEditSession = Boolean(editId);
  const { register, handleSubmit, reset, getValues, formState } = useForm({
    defaultValues: isEditSession ? editValues : {},
  });
  const { errors } = formState;
  const { isCreating, createCabin } = useCreateCabin();
  const { isEditing, editCabin } = useEditCabin();
  const isWorking = isCreating || isEditing;
  function onSubmit(data) {
    const image = typeof data.image === "string" ? data.image : data.image?.[0];
    // Ensure discount is a number, default to 0 if empty
    const discount = data.discount === "" || data.discount === undefined ? 0 : Number(data.discount);
    const cabinData = { ...data, image, discount };
    if (isEditSession) {
      editCabin(
        { newCabinData: cabinData, id: editId },
        {
          onSuccess: () => {
            toast.success("New cabin successfully edited");
            reset();
            onCloseModel?.();
          },
        }
      );
    } else {
      createCabin(
        { ...cabinData },
        {
          onSuccess: () => {
            reset();
            onCloseModel?.();
          },
        }
      );
    }
  }
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FormRow
        label="Cabin name"
        error={errors?.name?.message}
        type={onCloseModel ? "modal" : "regular"}
      >
        <Input
          type="text"
          id="name"
          disabled={isWorking}
          {...register("name", { required: "This field is required" })}
        />
      </FormRow>
      <FormRow label="Maximum capacity" error={errors?.maxCapacity?.message}>
        <Input
          type="number"
          id="maxCapacity"
          disabled={isWorking}
          {...register("maxCapacity", {
            required: "This field is required",
            min: { value: 1, message: "Capacity should be at least 1" },
          })}
        />
      </FormRow>
      <FormRow label="Regular price" error={errors?.regularPrice?.message}>
        <Input
          type="number"
          id="regularPrice"
          disabled={isWorking}
          {...register("regularPrice", {
            required: "This field is required",
            min: { value: 1, message: "Price should be at least 1" },
          })}
        />
      </FormRow>
      <FormRow label="Discount" error={errors?.discount?.message}>
        <Input
          type="number"
          id="discount"
          disabled={isWorking}
          defaultValue={0}
          {...register("discount", {
            validate: (value) =>
              value === "" || Number(value) <= getValues().regularPrice ||
              "Discount should be less than regular price",
          })}
        />
      </FormRow>
      <FormRow
        label="Description for website"
        error={errors?.description?.message}
      >
        <Textarea
          id="description"
          disabled={isWorking}
          {...register("description", {
            required: "This field is required",
            minLength: {
              value: 10,
              message: "Description should be at least 10 characters long",
            },
          })}
        />
      </FormRow>
      <FormRow label="Cabin photo" error={errors?.image?.message}>
        <FileInput
          id="image"
          accept="image/*"
          type="file"
          disabled={isWorking}
          {...register("image", {
            required: !isEditSession ? "This field is required" : false,
          })}
        />
      </FormRow>
      <FormRow type="buttons">
        <Button
          $variation="primary"
          type="reset"
          onClick={() => {
            onCloseModel();
          }}
        >
          Cancel
        </Button>
        <Button disabled={isWorking}>
          {isEditSession ? "Edit Cabin" : "Create new cabin"}
        </Button>
      </FormRow>
    </Form>
  );
}
export default CreateCabinForm;
