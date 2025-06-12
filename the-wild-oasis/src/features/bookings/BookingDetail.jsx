import styled from "styled-components";
import BookingDataBox from "./BookingDataBox.jsx";
import Row from "../../ui/Row.jsx";
import Heading from "../../ui/Heading.jsx";
import Tag from "../../ui/Tag.jsx";
import ButtonGroup from "../../ui/ButtonGroup.jsx";
import Button from "../../ui/Button.jsx";
import ButtonText from "../../ui/ButtonText.jsx";
import Spinner from "../../ui/Spinner.jsx";
import Empty from "../../ui/Empty.jsx";
import { useMoveBack } from "../../hooks/useMoveBack.js";
import useBooking from "./useBooking.js";
import { useNavigate } from "react-router-dom";
const HeadingGroup = styled.div`
  display: flex;
  gap: 2.4rem;
  align-items: center;
`;
function BookingDetail() {
  const { booking, isLoading, error } = useBooking();
  const moveBack = useMoveBack();
  const navigate = useNavigate();

  if (isLoading) return <Spinner />;

  if (error) {
    return (
      <>
        <Row type="horizontal">
          <HeadingGroup>
            <Heading as="h1">Booking not found</Heading>
          </HeadingGroup>
          <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
        </Row>

        <Row>
          <Empty resourceName="booking" />
          <p>The booking you&apos;re looking for could not be found.</p>
          <Button variation="primary" onClick={() => navigate("/bookings")}>
            View all bookings
          </Button>
        </Row>
      </>
    );
  }

  if (!booking) {
    return (
      <>
        <Row type="horizontal">
          <HeadingGroup>
            <Heading as="h1">No booking data</Heading>
          </HeadingGroup>
          <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
        </Row>

        <Row>
          <Empty resourceName="booking" />
          <Button variation="primary" onClick={() => navigate("/bookings")}>
            View all bookings
          </Button>
        </Row>
      </>
    );
  }

  const { status, id: bookingId } = booking;

  const statusToTagName = {
    unconfirmed: "blue",
    "checked-in": "green",
    "checked-out": "silver",
  };

  return (
    <>
      <Row type="horizontal">
        <HeadingGroup>
          <Heading as="h1">Booking #{bookingId}</Heading>
          <Tag type={statusToTagName[status] || "blue"}>
            {status?.replace("-", " ") || "Unknown status"}
          </Tag>
        </HeadingGroup>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={booking} />

      <ButtonGroup>
        <Button variation="secondary" onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  );
}

export default BookingDetail;
