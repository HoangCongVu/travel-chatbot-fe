import { useState } from 'react';
import { TextInput, Group, ActionIcon, Button, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface Destination {
  destination_name: string;
  embedding_vector?: number[] | null;
}

interface TourDestinationFormProps {
  initialDestinations?: Destination[];
  onChange: (destinations: Destination[]) => void;
}

export default function TourDestinationForm({ 
  initialDestinations = [{ destination_name: '', embedding_vector: null }],
  onChange 
}: TourDestinationFormProps) {
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);

  const addDestination = () => {
    const newDestinations = [...destinations, { destination_name: '', embedding_vector: null }];
    setDestinations(newDestinations);
    onChange(newDestinations);
  };

  const removeDestination = (index: number) => {
    if (destinations.length <= 1) return;
    
    const newDestinations = [...destinations];
    newDestinations.splice(index, 1);
    setDestinations(newDestinations);
    onChange(newDestinations);
  };

  const handleDestinationChange = (index: number, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index].destination_name = value;
    setDestinations(newDestinations);
    onChange(newDestinations);
  };

  return (
    <>
      <Text fw={500} mb="xs">Điểm Đến</Text>
      {destinations.map((dest, index) => (
        <Group key={index} mt={index > 0 ? 'md' : 0} align="flex-end">
          <TextInput
            label={index === 0 ? "Tên Điểm Đến" : ""}
            placeholder="Nhập tên điểm đến..."
            style={{ flex: 1 }}
            value={dest.destination_name}
            onChange={(e) => handleDestinationChange(index, e.target.value)}
          />
          <ActionIcon 
            color="red" 
            onClick={() => removeDestination(index)} 
            disabled={destinations.length <= 1}
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
        onClick={addDestination}
      >
        Thêm điểm đến
      </Button>
    </>
  );
} 