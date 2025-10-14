import { useState } from 'react';
import { Select, MultiSelect, Group, Box, ActionIcon, Button, Text, Divider } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconPlus, IconTrash } from '@tabler/icons-react';

interface RecurringSchedule {
  recurrence_type: string;
  start_date: Date | null;
  end_date: Date | null;
  weekdays: string[];
}

const RECURRENCE_TYPE_OPTIONS = [
  { value: 'daily', label: 'Hàng ngày' },
  { value: 'weekly', label: 'Hàng tuần' },
  { value: 'monthly', label: 'Hàng tháng' },
  { value: 'custom', label: 'Tùy chỉnh' },
];

const WEEKDAYS_OPTIONS = [
  { value: 'mon', label: 'Thứ 2' },
  { value: 'tue', label: 'Thứ 3' },
  { value: 'wed', label: 'Thứ 4' },
  { value: 'thu', label: 'Thứ 5' },
  { value: 'fri', label: 'Thứ 6' },
  { value: 'sat', label: 'Thứ 7' },
  { value: 'sun', label: 'Chủ nhật' },
];

interface RecurringScheduleFormProps {
  initialSchedules?: RecurringSchedule[];
  onChange: (schedules: RecurringSchedule[]) => void;
}

export default function RecurringScheduleForm({ 
  initialSchedules = [{ 
    recurrence_type: 'daily', 
    start_date: null, 
    end_date: null,
    weekdays: []
  }],
  onChange 
}: RecurringScheduleFormProps) {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>(initialSchedules);

  const addSchedule = () => {
    const newSchedules = [...schedules, { 
      recurrence_type: 'daily', 
      start_date: null, 
      end_date: null,
      weekdays: []
    }];
    setSchedules(newSchedules);
    onChange(newSchedules);
  };

  const removeSchedule = (index: number) => {
    if (schedules.length <= 1) return;
    
    const newSchedules = [...schedules];
    newSchedules.splice(index, 1);
    setSchedules(newSchedules);
    onChange(newSchedules);
  };

  const handleScheduleChange = (index: number, field: keyof RecurringSchedule, value: any) => {
    const newSchedules = [...schedules];
    newSchedules[index][field] = value;
    setSchedules(newSchedules);
    onChange(newSchedules);
  };

  return (
    <>
      <Text fw={500} mb="xs">Lịch Trình Định Kỳ</Text>
      {schedules.map((schedule, index) => (
        <Box key={index} mt={index > 0 ? 'xl' : 0}>
          {index > 0 && <Divider mb="md" />}
          <Group align="flex-end" mb="md">
            <Select
              label="Loại Lặp Lại"
              placeholder="Chọn loại lặp lại"
              data={RECURRENCE_TYPE_OPTIONS}
              style={{ flex: 1 }}
              value={schedule.recurrence_type}
              onChange={(value) => handleScheduleChange(index, 'recurrence_type', value)}
            />
            <ActionIcon 
              color="red" 
              onClick={() => removeSchedule(index)} 
              disabled={schedules.length <= 1}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
          <Group grow>
            <DateInput
              label="Ngày Bắt Đầu"
              placeholder="Chọn ngày bắt đầu"
              value={schedule.start_date}
              onChange={(date) => handleScheduleChange(index, 'start_date', date)}
            />
            <DateInput
              label="Ngày Kết Thúc"
              placeholder="Chọn ngày kết thúc"
              value={schedule.end_date}
              onChange={(date) => handleScheduleChange(index, 'end_date', date)}
              minDate={schedule.start_date || undefined}
            />
          </Group>
          {schedule.recurrence_type === 'weekly' && (
            <MultiSelect
              label="Các Ngày Trong Tuần"
              placeholder="Chọn các ngày trong tuần"
              data={WEEKDAYS_OPTIONS}
              mt="md"
              value={schedule.weekdays}
              onChange={(value) => handleScheduleChange(index, 'weekdays', value)}
            />
          )}
        </Box>
      ))}
      <Button 
        leftSection={<IconPlus size={16} />} 
        variant="outline" 
        size="sm" 
        mt="md"
        onClick={addSchedule}
      >
        Thêm lịch định kỳ
      </Button>
    </>
  );
} 