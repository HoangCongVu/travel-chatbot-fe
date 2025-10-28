import { useState } from "react";
import { TextInput, Group, ActionIcon, Button, Text } from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

interface HighlightLocation {
  location_name: string;
}

interface TourHighlightLocationFormProps {
  initialLocations?: HighlightLocation[];
  onChange: (locations: HighlightLocation[]) => void;
}

export default function TourHighlightLocationForm({
  initialLocations = [{ location_name: "" }],
  onChange,
}: TourHighlightLocationFormProps) {
  const [locations, setLocations] =
    useState<HighlightLocation[]>(initialLocations);

  const addLocation = () => {
    const newLocations = [...locations, { location_name: "" }];
    setLocations(newLocations);
    onChange(newLocations);
  };

  const removeLocation = (index: number) => {
    if (locations.length <= 1) return;

    const newLocations = [...locations];
    newLocations.splice(index, 1);
    setLocations(newLocations);
    onChange(newLocations);
  };

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index].location_name = value;
    setLocations(newLocations);
    onChange(newLocations);
  };

  return (
    <>
      {locations.map((location, index) => (
        <Group key={index} mt={index > 0 ? "md" : 0} align="flex-end">
          <TextInput
            label={index === 0 ? "Tên Địa Điểm Nổi Bật" : ""}
            placeholder="Nhập tên địa điểm nổi bật..."
            style={{ flex: 1 }}
            value={location.location_name}
            onChange={(e) => handleLocationChange(index, e.target.value)}
          />
          <ActionIcon
            color="red"
            onClick={() => removeLocation(index)}
            disabled={locations.length <= 1}
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
        onClick={addLocation}
      >
        Thêm địa điểm nổi bật
      </Button>
    </>
  );
}
