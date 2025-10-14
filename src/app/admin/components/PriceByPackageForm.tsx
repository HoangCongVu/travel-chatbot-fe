import { useState } from 'react';
import { TextInput, NumberInput, Group, ActionIcon, Button, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface PriceByPackage {
  package_name: string;
  price: number;
}

interface PriceByPackageFormProps {
  initialPrices?: PriceByPackage[];
  onChange: (prices: PriceByPackage[]) => void;
}

export default function PriceByPackageForm({ 
  initialPrices = [{ package_name: '', price: 0 }],
  onChange 
}: PriceByPackageFormProps) {
  const [prices, setPrices] = useState<PriceByPackage[]>(initialPrices);

  const addPrice = () => {
    const newPrices = [...prices, { package_name: '', price: 0 }];
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

  const handlePackageNameChange = (index: number, value: string) => {
    const newPrices = [...prices];
    newPrices[index].package_name = value;
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
      <Text fw={500} mb="xs">Giá Theo Gói</Text>
      {prices.map((priceItem, index) => (
        <Group key={index} mt={index > 0 ? 'md' : 0} align="flex-end">
          <TextInput
            label={index === 0 ? "Tên Gói" : ""}
            placeholder="Nhập tên gói..."
            style={{ flex: 1 }}
            value={priceItem.package_name}
            onChange={(e) => handlePackageNameChange(index, e.target.value)}
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
        Thêm giá theo gói
      </Button>
    </>
  );
} 