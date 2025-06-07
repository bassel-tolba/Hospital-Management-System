import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Select, Button, message } from "antd";
import moment from "moment";
import { usePatientStore } from "../../services/patient.service";
import { useUserStore } from "../../services/user.service";
import { useProductStore } from "../../services/product.service"; // Correct import
import { useAuthStore } from "../../services/auth.service";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const AppointmentFormModal = ({
  isVisible,
  onCancel,
  onSubmit,
  selectedAppointment,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const {
    patients,
    searchPatients,
    loading: patientsLoading,
  } = usePatientStore();
  const { users, searchUsers, loading: usersLoading } = useUserStore();
  // Correctly destructure fetchAllProducts and use productsLoading for product fetching state
  const {
    products,
    fetchAllProducts,
    loading: productsLoadingFromStore,
  } = useProductStore();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [patientOptions, setPatientOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [modalLoading, setModalLoading] = useState(false); // Renamed for clarity, used for form submission
  const { hasAuthority } = useAuthStore();

  // --- Data Fetching Effects ---
  useEffect(() => {
    const loadProducts = async () => {
      // The store's fetchAllProducts handles its own loading state (productsLoadingFromStore).
      // No need for separate modalLoading here for initial product fetch.
      try {
        await fetchAllProducts(); // Use the correct function name
      } catch (error) {
        // The store's fetchAllProducts already logs and shows a notification for errors.
        // Additional logging here can be useful for component-specific debugging.
        console.error(
          "Error fetching products in AppointmentFormModal:",
          error,
        );
      }
    };

    if (isVisible) {
      // Fetch products only when the modal becomes visible
      loadProducts();
    }
  }, [fetchAllProducts, isVisible]); // Add isVisible to dependencies to refetch if modal is reopened

  useEffect(() => {
    if (products && products.length > 0) {
      const appointmentProducts = products.filter(
        (product) => product.type === "APPOINTMENT",
      );
      setFilteredProducts(appointmentProducts);
    } else {
      setFilteredProducts([]); // Clear if no products or products array is empty
    }
  }, [products]);

  // --- Form Initialization and Reset ---
  useEffect(() => {
    if (isVisible) {
      // Only set/reset form when modal is visible to avoid issues
      if (selectedAppointment) {
        form.setFieldsValue({
          ...selectedAppointment,
          appointmentDateTime: selectedAppointment.appointmentDateTime
            ? moment(selectedAppointment.appointmentDateTime)
            : null,
          startTime: selectedAppointment.startTime
            ? moment(selectedAppointment.startTime)
            : null,
          endTime: selectedAppointment.endTime
            ? moment(selectedAppointment.endTime)
            : null,
          patientId: selectedAppointment.patientId,
          userId: selectedAppointment.userId,
          productId: selectedAppointment.productId,
        });
        // If editing, pre-populate search selects if data is available
        if (
          selectedAppointment.patientId &&
          selectedAppointment.patientFirstName &&
          selectedAppointment.patientLastName
        ) {
          setPatientOptions([
            {
              label: `${selectedAppointment.patientFirstName} ${selectedAppointment.patientLastName}`,
              value: selectedAppointment.patientId,
            },
          ]);
        }
        if (
          selectedAppointment.userId &&
          selectedAppointment.userFirstName &&
          selectedAppointment.userLastName
        ) {
          setUserOptions([
            {
              label: `${selectedAppointment.userFirstName} ${selectedAppointment.userLastName}`,
              value: selectedAppointment.userId,
            },
          ]);
        }
      } else {
        form.resetFields();
        setPatientOptions([]); // Clear options for new appointment
        setUserOptions([]); // Clear options for new appointment
      }
    }
  }, [selectedAppointment, form, isVisible]);

  // --- Patient Search ---
  const handlePatientSearch = async (value) => {
    if (value && value.trim() !== "") {
      try {
        const searchResults = await searchPatients({
          searchTerm: value,
          page: 0,
          size: 10,
        });
        setPatientOptions(
          searchResults?.content?.map((patient) => ({
            label: `${patient.firstName} ${patient.lastName}`,
            value: patient.id,
          })) || [],
        );
      } catch (error) {
        console.error("Failed to search patients:", error);
        setPatientOptions([]);
      }
    } else {
      setPatientOptions([]);
    }
  };

  // --- User Search ---
  const handleUserSearch = async (value) => {
    if (value && value.trim() !== "") {
      try {
        const searchParams = { search: value, page: 0, size: 10 }; // Added pagination for consistency
        const results = await searchUsers(searchParams);
        setUserOptions(
          results?.content?.map((user) => ({
            label: `${user.firstName} ${user.lastName}`,
            value: user.id,
          })) || [],
        );
      } catch (error) {
        console.error("Error searching users:", error);
        setUserOptions([]);
      }
    } else {
      setUserOptions([]);
    }
  };

  // --- Form Submission ---
  const handleFormSubmit = async () => {
    setModalLoading(true);
    try {
      const values = await form.validateFields();
      const appointmentData = {
        ...(selectedAppointment ? { id: selectedAppointment.id } : {}), // Include ID if editing
        ...values,
        appointmentDateTime: values.appointmentDateTime
          ? values.appointmentDateTime.toISOString()
          : null,
        startTime: values.startTime ? values.startTime.toISOString() : null,
        endTime: values.endTime ? values.endTime.toISOString() : null,
        // patientId, userId, productId are already in values
      };

      await onSubmit(appointmentData); // Make onSubmit an async function if it involves API calls
      // onCancel(); // Typically call onCancel or a success callback from parent after onSubmit completes
    } catch (errorInfo) {
      if (errorInfo.name === "SubmitError") {
        // If onSubmit itself throws an error we passed up
        // Error message is already handled by onSubmit or the service
        console.error(
          "Submission error handled by parent or service:",
          errorInfo.message,
        );
      } else if (errorInfo.errorFields) {
        // Antd form validation error
        console.error("Form validation failed:", errorInfo);
        message.error(t("appointments.formModal.error.validationFailed"));
      } else {
        // Other errors
        console.error(
          "An unexpected error occurred during form submission:",
          errorInfo,
        );
        message.error(t("common.error.unexpected"));
      }
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <Modal
      title={t(
        selectedAppointment
          ? "appointments.formModal.title.edit"
          : "appointments.formModal.title.add",
      )}
      open={isVisible}
      onCancel={() => {
        form.resetFields(); // Reset form fields when cancel is clicked
        setPatientOptions([]);
        setUserOptions([]);
        onCancel();
      }}
      onOk={handleFormSubmit}
      confirmLoading={modalLoading} // Use modalLoading for the OK button
      forceRender
      okText={t(selectedAppointment ? "common.update" : "common.save")}
      cancelText={t("common.cancel")}
      destroyOnClose // Add this to ensure form state is reset when modal is closed and reopened
    >
      <Form form={form} layout="vertical" name="appointment_form">
        <Form.Item
          label={t("appointments.formModal.label.dateTime")}
          name="appointmentDateTime"
          rules={[
            {
              required: true,
              message: t("appointments.formModal.validation.dateTimeRequired"),
            },
          ]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          label={t("appointments.formModal.label.startTime")}
          name="startTime"
          rules={[
            {
              required: true,
              message: t("appointments.formModal.validation.startTimeRequired"),
            },
          ]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          label={t("appointments.formModal.label.endTime")}
          name="endTime"
          rules={[
            {
              required: true,
              message: t("appointments.formModal.validation.endTimeRequired"),
            },
          ]}
        >
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: "100%" }}
          />
        </Form.Item>
        <Form.Item
          label={t("appointments.formModal.label.patient")}
          name="patientId"
          rules={[
            {
              required: true,
              message: t("appointments.formModal.validation.patientRequired"),
            },
          ]}
        >
          <Select
            showSearch
            placeholder={t("appointments.formModal.placeholder.searchPatient")}
            onSearch={handlePatientSearch}
            filterOption={false} // server-side search
            loading={patientsLoading}
            options={patientOptions}
            notFoundContent={patientsLoading ? null : t("common.noResults")}
            allowClear
          />
        </Form.Item>
        <Form.Item
          label={t("appointments.formModal.label.user")}
          name="userId"
          rules={[
            {
              required: true,
              message: t("appointments.formModal.validation.userRequired"),
            },
          ]}
        >
          <Select
            showSearch
            placeholder={t("appointments.formModal.placeholder.searchUser")}
            onSearch={handleUserSearch}
            filterOption={false} // server-side search
            loading={usersLoading}
            options={userOptions}
            notFoundContent={usersLoading ? null : t("common.noResults")}
            allowClear
          />
        </Form.Item>
        <Form.Item
          label={t("appointments.formModal.label.appointmentType")}
          name="productId"
          rules={[
            {
              required: true,
              message: t(
                "appointments.formModal.validation.appointmentTypeRequired",
              ),
            },
          ]}
        >
          <Select
            placeholder={t(
              "appointments.formModal.placeholder.selectAppointmentType",
            )}
            loading={productsLoadingFromStore} // Use the loading state from the product store
            allowClear
          >
            {filteredProducts.map((product) => (
              <Option key={product.id} value={product.id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AppointmentFormModal;
