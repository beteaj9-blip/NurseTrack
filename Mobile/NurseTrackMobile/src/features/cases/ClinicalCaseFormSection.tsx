import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { apiFetch } from '../../api';
import { AnyRecord, SectionProps } from '../shared/types';
import { Chip, Field, Panel, PrimaryButton, ReadOnly, styles } from '../shared/components';
import { dateIsFuture, getCaseType, shortDate } from '../shared/helpers';

export function ClinicalCaseFormSection({ token, user, setMessage, refresh }: SectionProps) {
  const [schedules, setSchedules] = useState<AnyRecord[]>([]);
  const [categories, setCategories] = useState<AnyRecord[]>([]);
  const [scheduleId, setScheduleId] = useState('');
  const [category, setCategory] = useState('');
  const [patientInitials, setPatientInitials] = useState('');
  const [procedureDetails, setProcedureDetails] = useState('');
  const [studentReflection, setStudentReflection] = useState('');

  useEffect(() => {
    apiFetch<AnyRecord[]>('/schedules/student', { token }).then(setSchedules).catch(() => setSchedules([]));
    apiFetch<AnyRecord[]>('/cases/categories', { token }).then(setCategories).catch(() => setCategories([]));
  }, [token]);

  const eligibleSchedules = schedules.filter((item) => !dateIsFuture(item.date ?? item.shiftDate));
  const selectedSchedule = eligibleSchedules.find((item) => String(item.id) === scheduleId);

  async function submit() {
    if (!selectedSchedule || !category || !patientInitials || !procedureDetails) {
      setMessage('Complete the required case information before submitting.');
      return;
    }
    const dutyArea = selectedSchedule.area ?? selectedSchedule.ward ?? '';
    try {
      await apiFetch('/cases', {
        method: 'POST',
        token,
        body: JSON.stringify({
          student: { id: user.id },
          instructor: { id: selectedSchedule.instructorId ?? selectedSchedule.instructor?.id },
          caseType: getCaseType(category, dutyArea),
          patientInitials,
          category,
          hospital: selectedSchedule.hospital ?? selectedSchedule.location,
          dutyArea,
          shiftTime: `${selectedSchedule.startTime ?? ''} - ${selectedSchedule.endTime ?? ''}`,
          caseDate: selectedSchedule.date ?? selectedSchedule.shiftDate,
          diagnosis: category,
          procedureDetails,
          studentReflection,
        }),
      });
      setMessage('Clinical case submitted for CI validation.');
      setPatientInitials('');
      setProcedureDetails('');
      setStudentReflection('');
      refresh();
    } catch {
      setMessage('Clinical case could not be submitted.');
    }
  }

  return (
    <Panel title="Case Information" badge="Draft">
      <Text style={styles.label}>Case Date</Text>
      <View style={styles.chipRow}>
        {eligibleSchedules.slice(0, 8).map((item) => <Chip key={item.id} label={`${shortDate(item.date ?? item.shiftDate)} - ${item.area ?? item.ward ?? 'Duty'}`} active={scheduleId === String(item.id)} onPress={() => setScheduleId(String(item.id))} />)}
      </View>
      <ReadOnly label="Time of Shift" value={selectedSchedule ? `${selectedSchedule.startTime ?? ''} - ${selectedSchedule.endTime ?? ''}` : 'Select a case date first'} />
      <Field label="Patient Name" value={patientInitials} onChangeText={setPatientInitials} placeholder="Initials only" />
      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {categories.map((item) => <Chip key={item.value ?? item.label} label={item.label ?? item.value} active={category === (item.value ?? item.label)} onPress={() => setCategory(item.value ?? item.label)} />)}
      </View>
      <Field label="Procedure Performed" value={procedureDetails} onChangeText={setProcedureDetails} />
      <ReadOnly label="Name of Hospital" value={selectedSchedule?.hospital ?? 'Select a case date first'} />
      <ReadOnly label="Duty Area" value={selectedSchedule?.area ?? selectedSchedule?.ward ?? 'Select a case date first'} />
      <Field label="Student Reflection" value={studentReflection} onChangeText={setStudentReflection} multiline />
      <PrimaryButton label="Submit Clinical Case" onPress={submit} />
    </Panel>
  );
}
