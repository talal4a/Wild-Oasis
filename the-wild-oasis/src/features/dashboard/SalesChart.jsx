import styled from "styled-components";
import DashboardBox from "./DashboardBox";
import Heading from "../../ui/Heading";
import { useDarkMode } from "../../context/DarkModeContext";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
import Spinner from "../../ui/Spinner";

const StyledSalesChart = styled(DashboardBox)`
  grid-column: 1 / -1;
  grid-row: 3;

  & .recharts-cartesian-grid-horizontal line,
  & .recharts-cartesian-grid-vertical line {
    stroke: var(--color-grey-300);
  }
`;

export default function SalesChart({ bookings = [], numDays }) {
  const { isDarkMode } = useDarkMode();

  // If no bookings data, show empty state
  if (!bookings || bookings.length === 0) {
    return (
      <StyledSalesChart>
        <Heading type="h2">Sales</Heading>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          No sales data available for the selected period
        </div>
      </StyledSalesChart>
    );
  }

  const allDates = eachDayOfInterval({
    start: subDays(new Date(), numDays - 1),
    end: new Date(),
  });

  const data = allDates.map((date) => {
    const bookingsForDate = bookings.filter((booking) => {
      const bookingDate = new Date(booking.startDate);
      const isMatch = isSameDay(date, bookingDate);
      return isMatch;
    });

    const totalSales = bookingsForDate.reduce(
      (acc, cur) => acc + (cur.totalPrice || 0),
      0
    );
    const extrasSales = bookingsForDate.reduce(
      (acc, cur) => acc + (cur.extrasPrice || 0),
      0
    );

    return {
      label: format(date, "MMM dd"),
      totalSales,
      extrasSales,
    };
  });

  const colors = isDarkMode
    ? {
        totalSales: { stroke: "#4f46e5", fill: "#4f46e5" },
        extrasSales: { stroke: "#22c55e", fill: "#22c55e" },
        text: "#e5e7eb",
        background: "#18212f",
      }
    : {
        totalSales: { stroke: "#4f46e5", fill: "#c7d2fe" },
        extrasSales: { stroke: "#16a34a", fill: "#dcfce7" },
        text: "#374151",
        background: "#fff",
      };

  return (
    <StyledSalesChart>
      <Heading type="h2">
        Sales from {format(allDates.at(0), "MMM dd yyy")} &mdash;
        {format(allDates.at(-1), "MMM dd yyy")}
      </Heading>
      <ResponsiveContainer height={300} width="100%">
        <AreaChart data={data}>
          <XAxis
            dataKey="label"
            tick={{ fill: colors.text }}
            tickLine={{ stroke: colors.text }}
          />
          <YAxis
            unit="$"
            tick={{ fill: colors.text }}
            tickLine={{ stroke: colors.text }}
          />
          <CartesianGrid strokeDasharray="4" />
          <Tooltip contentStyle={{ backgroundColor: colors.background }} />
          <Area
            type="monotone"
            dataKey="totalSales"
            stroke={colors.totalSales.stroke}
            fill={colors.totalSales.fill}
            name="Total Sales"
            strokeWidth={2}
            unit="$"
          />
          <Area
            type="monotone"
            dataKey="extrasSales"
            stroke={colors.extrasSales.stroke}
            fill={colors.extrasSales.fill}
            name="Extras Sales"
            strokeWidth={2}
            unit="$"
          />
        </AreaChart>
      </ResponsiveContainer>
    </StyledSalesChart>
  );
}
