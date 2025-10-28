import { NumberInput, Text } from "@mantine/core";

interface VisaPriceFormProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

export default function VisaPriceForm({ value, onChange }: VisaPriceFormProps) {
  return (
    <>
      <Text fw={500} mb="xs">
        Giá Visa(VNĐ)
      </Text>
      <NumberInput
        placeholder="Nhập giá visa nếu có (VNĐ)"
        value={value ?? undefined}
        onChange={(val) => onChange(typeof val === "number" ? val : null)}
        min={0}
        step={100000}
        thousandSeparator=","
      />
    </>
  );
}
