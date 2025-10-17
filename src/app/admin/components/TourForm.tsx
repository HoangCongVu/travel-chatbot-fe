import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Title,
  TextInput,
  Textarea,
  NumberInput,
  Button,
  Paper,
  Group,
  LoadingOverlay,
  Select,
  Stack,
  Text,
  Stepper,
  Alert,
} from "@mantine/core";
import { useForm, yupResolver } from "@mantine/form";
import * as Yup from "yup";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { createTourServices } from "@/services/createTourServices";

// Import our form components
import TourDestinationForm from "./TourDestinationForm";
import TourDepartureForm from "./TourDepartureForm";
import PriceByPackageForm from "./PriceByPackageForm";
import PriceByDateForm from "./PriceByDateForm";
import SpecificDepartureForm from "./SpecificDepartureForm";
import RecurringScheduleForm from "./RecurringScheduleForm";
import ImageUpload from "./ImageUpload";

// Định nghĩa các interface cho quản lý state của form
interface Destination {
  destination_name: string; // Tên điểm đến
  embedding_vector?: number[] | null; // Vector nhúng cho tìm kiếm (nếu có)
}

interface PriceByDate {
  date: Date | null; // Ngày áp dụng giá
  price: number; // Giá tour
}

interface PriceByPackage {
  package_name: string; // Tên gói tour
  price: number; // Giá của gói
}

interface RecurringSchedule {
  recurrence_type: string; // Loại lặp lại (daily/weekly/monthly)
  start_date: Date | null; // Ngày bắt đầu
  end_date: Date | null; // Ngày kết thúc
  weekdays: string[]; // Các ngày trong tuần (nếu loại là weekly)
}

interface SpecificDeparture {
  date: Date | null; // Ngày khởi hành cụ thể
}

interface TourDeparture {
  departure_name: string; // Tên điểm khởi hành
}

// Schema validation sử dụng Yup
const schema = Yup.object().shape({
  tour_name: Yup.string()
    .required("Tên tour là bắt buộc")
    .min(5, "Tên tour phải có ít nhất 5 ký tự"),
  tour_type_id: Yup.number()
    .required("Mã loại tour là bắt buộc")
    .integer("Mã loại tour phải là số nguyên")
    .min(0, "Mã loại tour không hợp lệ"),
  days: Yup.number()
    .required("Số ngày là bắt buộc")
    .integer("Số ngày phải là số nguyên")
    .min(1, "Số ngày phải ít nhất là 1"),
  description: Yup.string()
    .min(20, "Mô tả phải có ít nhất 20 ký tự (nếu có)")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  itinerary_url: Yup.string()
    .url("URL lịch trình không hợp lệ (nếu có)")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  detail_url: Yup.string()
    .url("URL chi tiết không hợp lệ (nếu có)")
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  promotion_info: Yup.string()
    .nullable()
    .transform((value) => (value === "" ? null : value)),
  price_type: Yup.string().required("Loại giá là bắt buộc"),
  price: Yup.number().when("price_type", {
    is: (val: string) => val === "Cố định",
    then: (schema) =>
      schema
        .required("Giá là bắt buộc")
        .typeError("Giá phải là số")
        .min(1, "Giá phải lớn hơn 0"),
    otherwise: (schema) => schema.transform(() => undefined),
  }),
});

const TOUR_TYPE_OPTIONS = [
  { value: "1", label: "Tour trong nước (nội địa)" },
  { value: "2", label: "Tour quốc tế (nước ngoài)" },
  { value: "3", label: "Tour trong ngày" },
  { value: "4", label: "Combo du lịch (gói dịch vụ)" },
  { value: "5", label: "Team building" },
  { value: "6", label: "MICE (du lịch hội nghị, hội thảo)" },
  { value: "7", label: "Free & Easy (vé máy bay + khách sạn)" },
];

const PRICE_TYPE_OPTIONS = [
  { value: "Cố định", label: "Cố định" },
  { value: "Dựa trên ngày khởi hành", label: "Dựa trên ngày khởi hành" },
  { value: "Dựa trên gói", label: "Dựa trên gói" },
  { value: "Theo yêu cầu", label: "Theo yêu cầu" },
];

interface TourFormProps {
  initialValues?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export default function TourForm({
  initialValues = null,
  isEdit = false,
  onSuccess,
}: TourFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [active, setActive] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Debug initialValues
  console.log("🔍 TourForm Props:", {
    isEdit,
    initialValues,
    tourId: initialValues?.tour_id,
  });

  // State for the different form sections
  const [destinations, setDestinations] = useState<Destination[]>([
    { destination_name: "", embedding_vector: null },
  ]);
  const [pricesByDate, setPricesByDate] = useState<PriceByDate[]>([
    { date: null, price: 0 },
  ]);
  const [pricesByPackage, setPricesByPackage] = useState<PriceByPackage[]>([
    { package_name: "", price: 0 },
  ]);
  const [recurringSchedules, setRecurringSchedules] = useState<
    RecurringSchedule[]
  >([
    {
      recurrence_type: "daily",
      start_date: null,
      end_date: null,
      weekdays: [],
    },
  ]);
  const [specificDepartures, setSpecificDepartures] = useState<
    SpecificDeparture[]
  >([{ date: null }]);
  const [tourDepartures, setTourDepartures] = useState<TourDeparture[]>([
    { departure_name: "" },
  ]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  const form = useForm({
    initialValues: initialValues
      ? {
          tour_name: initialValues.tour_name || "",
          tour_type_id: initialValues.tour_type_id?.toString() || "1",
          days: initialValues.days || 1,
          description: initialValues.description || "",
          highlight: initialValues.highlight || "",
          itinerary_url: initialValues.itinerary_url || "",
          image_url: initialValues.image_url || "",
          promotion_info: initialValues.promotion_info || "",
          price_type: initialValues.price_type || "Cố định",
          price: initialValues.price || undefined,
        }
      : {
          tour_name: "",
          tour_type_id: "1",
          days: 1,
          description: "",
          highlight: "",
          itinerary_url: "",
          image_url: "",
          promotion_info: "",
          price_type: "Cố định",
          price: undefined,
        },
    validate: yupResolver(schema),
  });

  // Helper to check for field-specific validation errors
  const getFieldError = (fieldName: string): string | null => {
    if (validationErrors[fieldName] && validationErrors[fieldName].length > 0) {
      return validationErrors[fieldName][0];
    }
    return null;
  };

  const priceType = form.values.price_type;

  // Load initial data for edit mode
  useEffect(() => {
    if (isEdit && initialValues) {
      console.log("Loading initial values for edit:", initialValues);

      // Populate destinations
      if (initialValues.destinations && initialValues.destinations.length > 0) {
        const mappedDestinations = initialValues.destinations.map(
          (dest: string) => ({
            destination_name: dest,
            embedding_vector: null,
          })
        );
        setDestinations(mappedDestinations);
      }

      // Populate departures
      if (initialValues.departures && initialValues.departures.length > 0) {
        const mappedDepartures = initialValues.departures.map(
          (dep: string) => ({
            departure_name: dep,
          })
        );
        setTourDepartures(mappedDepartures);
      }

      // Populate prices by package
      if (
        initialValues.price_by_packages &&
        initialValues.price_by_packages.length > 0
      ) {
        const mappedPrices = initialValues.price_by_packages.map(
          (pkg: any) => ({
            package_name: pkg.package_name,
            price: pkg.price,
          })
        );
        setPricesByPackage(mappedPrices);
      }

      // Populate prices by date
      if (
        initialValues.price_by_dates &&
        initialValues.price_by_dates.length > 0
      ) {
        const mappedPrices = initialValues.price_by_dates.map(
          (datePrice: any) => ({
            date: new Date(datePrice.date),
            price: datePrice.price,
          })
        );
        setPricesByDate(mappedPrices);
      }

      // Populate departure schedules
      if (
        initialValues.departure_schedules &&
        initialValues.departure_schedules.length > 0
      ) {
        const recurringSchedules: RecurringSchedule[] = [];
        const specificDepartures: SpecificDeparture[] = [];

        initialValues.departure_schedules.forEach((schedule: any) => {
          if (
            schedule.schedule_type === "recurring" &&
            schedule.recurring_schedules
          ) {
            schedule.recurring_schedules.forEach((recurring: any) => {
              recurringSchedules.push({
                recurrence_type: recurring.recurrence_type,
                start_date: new Date(recurring.start_date),
                end_date: new Date(recurring.end_date),
                weekdays: recurring.weekdays || [],
              });
            });
          }

          if (
            schedule.schedule_type === "specific" &&
            schedule.specific_dates
          ) {
            schedule.specific_dates.forEach((date: string) => {
              specificDepartures.push({
                date: new Date(date),
              });
            });
          }
        });

        if (recurringSchedules.length > 0) {
          setRecurringSchedules(recurringSchedules);
        }

        if (specificDepartures.length > 0) {
          setSpecificDepartures(specificDepartures);
        }
      }

      console.log("Populated form data for edit mode");
    }
  }, [isEdit, initialValues]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    setError(null);
    setValidationErrors({});
    console.log("Starting form submission...");

    try {
      let finalImageUrl = "";

      // 🔥 STEP 1: Handle image upload if user selected a new file
      if (values.image_url && values.image_url instanceof File) {
        console.log("📤 Uploading image file...");
        try {
          const uploadResult = await createTourServices.uploadImage(
            values.image_url
          );
          if (uploadResult.success) {
            finalImageUrl = uploadResult.url;
            console.log("✅ Image uploaded successfully:", finalImageUrl);
          } else {
            throw new Error(uploadResult.error || "Upload ảnh thất bại");
          }
        } catch (uploadError: any) {
          console.error("❌ Image upload failed:", uploadError);
          throw new Error("Upload ảnh thất bại: " + uploadError.message);
        }
      } else if (typeof values.image_url === "string") {
        // Use existing image URL (for edit mode)
        finalImageUrl = values.image_url;
      }

      // 🔥 STEP 2: Create the main tour payload
      const tourPayload: any = {
        tour_name: values.tour_name,
        tour_type_id: Number(values.tour_type_id),
        days: Number(values.days),
        description: values.description || "Chưa có mô tả",
        highlight: values.highlight || "Chưa có điểm nổi bật",
        itinerary_url: values.itinerary_url || "",
        image_url: finalImageUrl,
        promotion_info: values.promotion_info || "Chưa có khuyến mãi",
        price_type: values.price_type,
      };

      // Only add price if price_type is "Cố định"
      if (values.price_type === "Cố định" && values.price) {
        tourPayload.price = String(values.price);
      }

      console.log("Submitting tour payload:", tourPayload);

      // 🔥 STEP 3: Submit the tour (CREATE or UPDATE)
      let tourResponse;
      let tourId;

      if (isEdit && initialValues?.tour_id) {
        // UPDATE existing tour
        tourId = initialValues.tour_id;
        console.log("🔄 UPDATE MODE - Tour ID:", tourId);
        tourResponse = await createTourServices.updateTour(tourId, tourPayload);
        console.log("Tour UPDATE API response:", tourResponse);
      } else {
        // CREATE new tour
        tourResponse = await createTourServices.createTour(tourPayload);
        console.log("Tour CREATE API response:", tourResponse);

        tourId = tourResponse.data?.id || tourResponse.id;
        if (!tourId) {
          console.error(
            "Invalid or missing tour ID in response:",
            tourResponse
          );
          throw new Error("Không nhận được ID tour từ API");
        }
      }

      // Check if tour operation was successful
      if (!tourResponse.success) {
        throw new Error(
          tourResponse.error ||
            (isEdit ? "Không thể cập nhật tour" : "Không thể tạo tour")
        );
      }

      console.log(
        `Successfully ${isEdit ? "updated" : "created"} tour with ID:`,
        tourId
      );

      // 🔥 STEP 4: Process all related entities (destinations, departures, prices, schedules)
      const results = await Promise.allSettled([
        // Process destinations
        (async () => {
          try {
            const validDestinations = destinations.filter(
              (d) => d.destination_name.trim() !== ""
            );
            console.log(
              `Processing ${validDestinations.length} destinations...`
            );

            for (const destination of validDestinations) {
              const destResponse =
                await createTourServices.createTourDestination({
                  tour_id: tourId,
                  destination_name: destination.destination_name,
                });

              if (!destResponse.success) {
                console.error(
                  "Error creating destination:",
                  destResponse.error
                );
              } else {
                console.log("Destination response:", destResponse.data);
              }
            }
            return { success: true, type: "destinations" };
          } catch (error) {
            console.error("Error processing destinations:", error);
            return { success: false, type: "destinations", error };
          }
        })(),

        // Process tour departures
        (async () => {
          try {
            const validTourDepartures = tourDepartures.filter(
              (d) => d.departure_name.trim() !== ""
            );
            console.log(
              `Processing ${validTourDepartures.length} departures...`
            );

            for (const departure of validTourDepartures) {
              const departureResponse =
                await createTourServices.createTourDeparture({
                  tour_id: tourId,
                  departure_name: departure.departure_name,
                });

              if (!departureResponse.success) {
                console.error(
                  "Error creating departure:",
                  departureResponse.error
                );
              } else {
                console.log("Departure response:", departureResponse.data);
              }
            }
            return { success: true, type: "departures" };
          } catch (error) {
            console.error("Error processing departures:", error);
            return { success: false, type: "departures", error };
          }
        })(),

        // Process prices based on price_type
        (async () => {
          try {
            if (values.price_type === "Cố định") {
              // For fixed price, create a package with name "Cố định"
              console.log("Creating fixed price package...");

              const priceResponse =
                await createTourServices.createPriceByPackage({
                  tour_id: tourId,
                  package_name: "Cố định",
                  price: Number(values.price),
                });

              if (!priceResponse.success) {
                console.error(
                  "Error creating fixed price package:",
                  priceResponse.error
                );
              } else {
                console.log("Fixed price package created:", priceResponse.data);
              }
            } else if (values.price_type === "Dựa trên ngày khởi hành") {
              const validPricesByDate = pricesByDate.filter(
                (p) => p.date && p.price > 0
              );
              console.log(
                `Processing ${validPricesByDate.length} prices by date...`
              );

              for (const priceItem of validPricesByDate) {
                const priceResponse =
                  await createTourServices.createPriceByDate({
                    tour_id: tourId,
                    date: priceItem.date!,
                    price: priceItem.price,
                  });

                if (!priceResponse.success) {
                  console.error(
                    "Error creating price by date:",
                    priceResponse.error
                  );
                } else {
                  console.log("Price by date response:", priceResponse.data);
                }
              }
            } else if (values.price_type === "Dựa trên gói") {
              const validPricesByPackage = pricesByPackage.filter(
                (p) => p.package_name.trim() !== "" && p.price > 0
              );
              console.log(
                `Processing ${validPricesByPackage.length} prices by package...`
              );

              for (const priceItem of validPricesByPackage) {
                const priceResponse =
                  await createTourServices.createPriceByPackage({
                    tour_id: tourId,
                    package_name: priceItem.package_name,
                    price: priceItem.price,
                  });

                if (!priceResponse.success) {
                  console.error(
                    "Error creating price by package:",
                    priceResponse.error
                  );
                } else {
                  console.log("Price by package response:", priceResponse.data);
                }
              }
            }
            return { success: true, type: "prices" };
          } catch (error) {
            console.error("Error processing prices:", error);
            return { success: false, type: "prices", error };
          }
        })(),

        // Process schedules (recurring and specific)
        (async () => {
          try {
            // Process recurring schedules
            const validRecurringSchedules = recurringSchedules.filter(
              (s) => s.start_date && s.end_date
            );
            console.log(
              `Processing ${validRecurringSchedules.length} recurring schedules...`
            );

            for (const schedule of validRecurringSchedules) {
              try {
                // Step 1: Create departure schedule first to get schedule_id
                const depScheduleResponse =
                  await createTourServices.createDepartureSchedule({
                    tour_id: tourId,
                    schedule_type: "recurring",
                  });

                if (!depScheduleResponse.success) {
                  console.error(
                    "Error creating departure schedule:",
                    depScheduleResponse.error
                  );
                  continue;
                }

                const scheduleId =
                  depScheduleResponse.data?.id || depScheduleResponse.id;
                if (!scheduleId) {
                  console.error(
                    "No schedule_id received from departure schedule"
                  );
                  continue;
                }

                // Step 2: Create recurring schedule with the schedule_id
                const schedulePayload = {
                  schedule_id: scheduleId,
                  recurrence_type: schedule.recurrence_type,
                  start_date: schedule.start_date!,
                  end_date: schedule.end_date!,
                  weekdays:
                    schedule.recurrence_type === "weekly"
                      ? schedule.weekdays
                      : null,
                };

                const scheduleResponse =
                  await createTourServices.createRecurringSchedule(
                    schedulePayload
                  );

                if (!scheduleResponse.success) {
                  console.error(
                    "Error creating recurring schedule:",
                    scheduleResponse.error
                  );
                } else {
                  console.log(
                    "Recurring schedule created successfully:",
                    scheduleResponse.data
                  );
                }
              } catch (scheduleError) {
                console.error(
                  "Error processing a recurring schedule:",
                  scheduleError
                );
                // Continue with next schedule
              }
            }

            // Process specific departures
            const validSpecificDepartures = specificDepartures.filter(
              (d) => d.date
            );
            console.log(
              `Processing ${validSpecificDepartures.length} specific departures...`
            );

            for (const departure of validSpecificDepartures) {
              try {
                // Step 1: Create departure schedule first to get schedule_id
                const depScheduleResponse =
                  await createTourServices.createDepartureSchedule({
                    tour_id: tourId,
                    schedule_type: "specific",
                  });

                if (!depScheduleResponse.success) {
                  console.error(
                    "Error creating departure schedule:",
                    depScheduleResponse.error
                  );
                  continue;
                }

                const scheduleId =
                  depScheduleResponse.data?.id || depScheduleResponse.id;
                if (!scheduleId) {
                  console.error(
                    "No schedule_id received from departure schedule"
                  );
                  continue;
                }

                // Step 2: Create specific departure with the schedule_id
                const specificDepartureResponse =
                  await createTourServices.createSpecificDeparture({
                    schedule_id: scheduleId,
                    date: departure.date!,
                  });

                if (!specificDepartureResponse.success) {
                  console.error(
                    "Error creating specific departure:",
                    specificDepartureResponse.error
                  );
                } else {
                  console.log(
                    "Specific departure created successfully:",
                    specificDepartureResponse.data
                  );
                }
              } catch (departureError) {
                console.error(
                  "Error processing a specific departure:",
                  departureError
                );
                // Continue with next departure
              }
            }

            return { success: true, type: "schedules" };
          } catch (error) {
            console.error("Error processing schedules:", error);
            return { success: false, type: "schedules", error };
          }
        })(),
      ]);

      // Log all results for debugging
      console.log("API operations results:", results);

      // Check if any critical operations failed
      const failedOperations = results
        .filter(
          (result) =>
            result.status === "rejected" ||
            (result.status === "fulfilled" && !result.value.success)
        )
        .map((result) => {
          if (result.status === "rejected") {
            return { type: "unknown", error: result.reason };
          }
          return (
            result as PromiseFulfilledResult<{
              success: boolean;
              type: string;
              error?: any;
            }>
          ).value;
        });

      if (failedOperations.length > 0) {
        console.warn("Some operations failed:", failedOperations);
        // We still continue as the tour was created
      }

      // If we reach here, the tour was created successfully
      // (even if some related entities may have failed)
      console.log(
        "Tour and related entities processed. Showing success notification..."
      );

      notifications.show({
        title: "Thành công",
        message: isEdit ? "Tour đã được cập nhật" : "Tour đã được tạo",
        color: "green",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/tour");
      }
    } catch (error: any) {
      console.error("Error processing tour:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        stack: error.stack,
      });

      setError(error.message || "Không thể xử lý tour. Vui lòng thử lại.");

      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể lưu tour",
        color: "red",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container
      size="md"
      py="xl"
      style={{ height: "90vh", display: "flex", flexDirection: "column" }}
    >
      <Paper
        shadow="md"
        radius="md"
        withBorder
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <LoadingOverlay
          visible={isSubmitting}
          overlayProps={{ radius: "sm", blur: 2 }}
        />

        {/* Fixed Header */}
        <div style={{ padding: "24px 24px 0 24px", flexShrink: 0 }}>
          <Title order={2} ta="center" mb="xl" c="blue.6">
            {isEdit ? "Cập Nhật Tour Du Lịch" : "Tạo Tour Mới"}
          </Title>

          {error && (
            <Alert color="red" title="Lỗi" mb="md" icon={<IconAlertCircle />}>
              {error}
            </Alert>
          )}

          {Object.keys(validationErrors).length > 0 && (
            <Alert
              color="orange"
              title="Lỗi kiểm tra dữ liệu"
              mb="md"
              icon={<IconAlertCircle />}
            >
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                {Object.entries(validationErrors).map(([field, errors]) =>
                  errors.map((errorMessage, idx) => (
                    <li key={`${field}-${idx}`}>
                      <strong>{field}</strong>: {errorMessage}
                    </li>
                  ))
                )}
              </ul>
            </Alert>
          )}
        </div>

        {/* Scrollable Form Content */}
        <div
          style={{ padding: "0 24px 24px 24px", flex: 1, overflowY: "auto" }}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stepper active={active} onStepClick={setActive}>
              <Stepper.Step label="Bước 1" description="Thông tin cơ bản">
                <Stack gap="md">
                  <TextInput
                    label="Tên Tour"
                    placeholder="Nhập tên tour..."
                    required
                    error={getFieldError("tour_name") || form.errors.tour_name}
                    {...form.getInputProps("tour_name")}
                  />
                  <Group grow>
                    <Select
                      label="Loại Tour"
                      placeholder="Chọn loại tour"
                      data={TOUR_TYPE_OPTIONS}
                      required
                      error={
                        getFieldError("tour_type_id") ||
                        form.errors.tour_type_id
                      }
                      {...form.getInputProps("tour_type_id")}
                    />
                    <NumberInput
                      label="Số Ngày"
                      placeholder="Nhập số ngày"
                      required
                      min={1}
                      error={getFieldError("days") || form.errors.days}
                      {...form.getInputProps("days")}
                    />
                  </Group>
                  <Textarea
                    label="Mô Tả Tour"
                    placeholder="Chi tiết về tour (tối thiểu 20 ký tự nếu nhập)..."
                    autosize
                    minRows={3}
                    error={
                      getFieldError("description") || form.errors.description
                    }
                    {...form.getInputProps("description")}
                  />
                  <Textarea
                    label="Điểm Nổi Bật"
                    placeholder="Những điểm nổi bật của tour..."
                    autosize
                    minRows={2}
                    error={getFieldError("highlight") || form.errors.highlight}
                    {...form.getInputProps("highlight")}
                  />
                  <TextInput
                    label="URL Lịch Trình"
                    placeholder="https://example.com/itinerary"
                    type="url"
                    error={
                      getFieldError("itinerary_url") ||
                      form.errors.itinerary_url
                    }
                    {...form.getInputProps("itinerary_url")}
                  />
                  <ImageUpload
                    label="Hình Ảnh Tour"
                    value={form.values.image_url}
                    onChange={(url) => form.setFieldValue("image_url", url)}
                    error={
                      (getFieldError("image_url") ||
                        form.errors.image_url) as string
                    }
                    placeholder="Upload ảnh hoặc kéo thả file vào đây"
                  />
                  <Textarea
                    label="Thông Tin Khuyến Mãi"
                    placeholder="Các ưu đãi hiện có..."
                    error={
                      getFieldError("promotion_info") ||
                      form.errors.promotion_info
                    }
                    {...form.getInputProps("promotion_info")}
                  />
                </Stack>
              </Stepper.Step>
              <Stepper.Step label="Bước 2" description="Điểm đến">
                <TourDestinationForm
                  onChange={(v: Destination[]) => setDestinations(v)}
                  initialDestinations={destinations}
                />
              </Stepper.Step>
              <Stepper.Step label="Bước 3" description="Điểm khởi hành">
                <TourDepartureForm
                  onChange={(v: TourDeparture[]) => setTourDepartures(v)}
                  initialDepartures={tourDepartures}
                />
              </Stepper.Step>
              <Stepper.Step label="Bước 4" description="Lịch trình">
                <RecurringScheduleForm
                  onChange={(v: RecurringSchedule[]) =>
                    setRecurringSchedules(v)
                  }
                  initialSchedules={recurringSchedules}
                />
                <SpecificDepartureForm
                  onChange={(v: SpecificDeparture[]) =>
                    setSpecificDepartures(v)
                  }
                  initialDepartures={specificDepartures}
                />
              </Stepper.Step>
              <Stepper.Step label="Bước 5" description="Giá">
                <Select
                  label="Loại Giá"
                  placeholder="Chọn loại giá"
                  data={PRICE_TYPE_OPTIONS}
                  required
                  mb="md"
                  {...form.getInputProps("price_type")}
                />
                {priceType === "Cố định" && (
                  <NumberInput
                    label="Giá (VND)"
                    placeholder="Nhập giá..."
                    min={1}
                    required
                    {...form.getInputProps("price")}
                  />
                )}
                {priceType === "Dựa trên ngày khởi hành" && (
                  <PriceByDateForm
                    onChange={(v: PriceByDate[]) => setPricesByDate(v)}
                    initialPrices={pricesByDate}
                  />
                )}
                {priceType === "Dựa trên gói" && (
                  <PriceByPackageForm
                    onChange={(v: PriceByPackage[]) => setPricesByPackage(v)}
                    initialPrices={pricesByPackage}
                  />
                )}
              </Stepper.Step>
            </Stepper>
            <Group justify="space-between" mt="xl">
              <Button
                variant="default"
                onClick={() => setActive((current) => Math.max(current - 1, 0))}
                disabled={active === 0}
              >
                Quay lại
              </Button>
              {active < 4 ? (
                <Button
                  onClick={() =>
                    setActive((current) => Math.min(current + 1, 4))
                  }
                >
                  Tiếp theo
                </Button>
              ) : (
                <Button
                  type="submit"
                  loading={isSubmitting}
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan" }}
                >
                  {isEdit ? "Cập Nhật" : "Tạo Tour"}
                </Button>
              )}
            </Group>
          </form>
        </div>
      </Paper>
    </Container>
  );
}
