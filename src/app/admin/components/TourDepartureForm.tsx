import { useState } from 'react';
import { TextInput, Group, ActionIcon, Button, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface TourDeparture {
  departure_name: string;
}

interface TourDepartureFormProps {
  initialDepartures?: TourDeparture[];
  onChange: (departures: TourDeparture[]) => void;
}

export default function TourDepartureForm({ 
  initialDepartures = [{ departure_name: '' }],
  onChange 
}: TourDepartureFormProps) {
  const [departures, setDepartures] = useState<TourDeparture[]>(initialDepartures);

  const addDeparture = () => {
    const newDepartures = [...departures, { departure_name: '' }];
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

  const handleDepartureChange = (index: number, value: string) => {
    const newDepartures = [...departures];
    newDepartures[index].departure_name = value;
    setDepartures(newDepartures);
    onChange(newDepartures);
  };

  return (
    <>
      <Text fw={500} mb="xs">Điểm Khởi Hành</Text>
      {departures.map((departure, index) => (
        <Group key={index} mt={index > 0 ? 'md' : 0} align="flex-end">
          <TextInput
            label={index === 0 ? "Tên Điểm Khởi Hành" : ""}
            placeholder="Nhập tên điểm khởi hành..."
            style={{ flex: 1 }}
            value={departure.departure_name}
            onChange={(e) => handleDepartureChange(index, e.target.value)}
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
        Thêm điểm khởi hành
      </Button>
    </>
  );
} 