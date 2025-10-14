import { useState } from 'react';
import { NumberInput, Group, ActionIcon, Button, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface PriceByDate {
  date: Date | null;
  price: number;
}

interface PriceByDateFormProps {
  initialPrices?: PriceByDate[];
  onChange: (prices: PriceByDate[]) => void;
}

export default function PriceByDateForm({ 
  initialPrices = [{ date: null, price: 0 }],
  onChange 
}: PriceByDateFormProps) {
  const [prices, setPrices] = useState<PriceByDate[]>(initialPrices);

  const addPrice = () => {
    const newPrices = [...prices, { date: null, price: 0 }];
    setPrices(newPrices);
    onChange(newPrices);
  };

  const removePrice = (index: number) => {
    if (prices.length <= 1) return;
    
    const newPrices = [...prices];
    newPrices.splice(index, 1);
    setPrices(newPrices);
    onChange(newPrices);
  };

  const handleDateChange = (index: number, value: Date | null) => {
    const newPrices = [...prices];
    newPrices[index].date = value;
    setPrices(newPrices);
    onChange(newPrices);
  };

  const handlePriceChange = (index: number, value: number) => {
    const newPrices = [...prices];
    newPrices[index].price = value || 0;
    setPrices(newPrices);
    onChange(newPrices);
  };

  return (
    <>
      <Text fw={500} mb="xs">Giá Theo Ngày</Text>
      {prices.map((priceItem, index) => (
        <Group key={index} mt={index > 0 ? 'md' : 0} align="flex-end">
          <DateInput
            label={index === 0 ? "Ngày" : ""}
            placeholder="Chọn ngày..."
            style={{ flex: 1 }}
            value={priceItem.date}
            onChange={(date) => handleDateChange(index, date)}
          />
          <NumberInput
            label={index === 0 ? "Giá (VND)" : ""}
            placeholder="Nhập giá..."
            min={0}
            style={{ flex: 1 }}
            value={priceItem.price}
            onChange={(value) => handlePriceChange(index, Number(value))}
          />
          <ActionIcon 
            color="red" 
            onClick={() => removePrice(index)} 
            disabled={prices.length <= 1}
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
        onClick={addPrice}
      >
        Thêm giá theo ngày
      </Button>
    </>
  );
} 