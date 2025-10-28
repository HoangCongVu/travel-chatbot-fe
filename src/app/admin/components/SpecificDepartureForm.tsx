import { useState } from "react";
import { Group, ActionIcon, Button, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconPlus, IconTrash } from "@tabler/icons-react";

interface SpecificDeparture {
  date: Date | null;
}

interface SpecificDepartureFormProps {
  initialDepartures?: SpecificDeparture[];
  onChange: (departures: SpecificDeparture[]) => void;
}

export default function SpecificDepartureForm({
  initialDepartures = [{ date: null }],
  onChange,
}: SpecificDepartureFormProps) {
  const [departures, setDepartures] =
    useState<SpecificDeparture[]>(initialDepartures);

  const addDeparture = () => {
    const newDepartures = [...departures, { date: null }];
    setDepartures(newDepartures);
    onChange(newDepartures);
  };

  const removeDeparture = (index: number) => {
    if (departures.length <= 1) return;

    const newDepartures = [...departures];
    newDepartures.splice(index, 1);
    setDepartures(newDepartures);
    onChange(newDepartures);
  };

  const handleDateChange = (index: number, value: Date | string | null) => {
    const newDepartures = [...departures];
    newDepartures[index].date =
      typeof value === "string" ? new Date(value) : value;
    setDepartures(newDepartures);
    onChange(newDepartures);
  };

  return (
    <>
      {/* <Text fw={500} mb="xs">
        Ngày Khởi Hành Cụ Thể
      </Text> */}
      {departures.map((departure, index) => (
        <Group key={index} mt={index > 0 ? "md" : 0} align="flex-end">
          <DateInput
            label={index === 0 ? "Ngày Khởi Hành Cụ Thể" : ""}
            placeholder="Chọn ngày khởi hành..."
            style={{ flex: 1 }}
            value={departure.date}
            onChange={(date) => handleDateChange(index, date)}
          />
          <ActionIcon
            color="red"
            onClick={() => removeDeparture(index)}
            disabled={departures.length <= 1}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      <Button
        leftSection={<IconPlus size={16} />}
        variant="outline"
        size="sm"
        mt="md"
        onClick={addDeparture}
      >
        Thêm ngày khởi hành
      </Button>
    </>
  );
}
