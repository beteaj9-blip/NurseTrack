import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { apiFetch } from '../../api';
import { AnyRecord, SectionProps } from '../shared/types';
import { Chip, Field, Panel, PrimaryButton, ReadOnly, RecordCard, styles } from '../shared/components';
import { dateIsFuture, shortDate } from '../shared/helpers';

export function AppealFormSection({ token, user, setMessage, refresh }: SectionProps) {
  const [appeals, setAppeals] = useState<AnyRecord[]>([]);
  const [schedules, setSchedules] = useState<AnyRecord[]>([]);
  const [scheduleId, setScheduleId] = useState('not-applicable');
  const [appealType, setAppealType] = useState('');
  const [title, setTitle] = useState('');
  const [studentReason, setStudentReason] = useState('');
  const [evidenceNotes, setEvidenceNotes] = useState('');

  useEffect(() => {
    apiFetch<AnyRecord[]>('/appeals/student', { token }).then(setAppeals).catch(() => setAppeals([]));
    apiFetch<AnyRecord[]>('/schedules/student', { token }).then(setSchedules).catch(() => setSchedules([]));
  }, [token]);

  const eligibleSchedules = schedules.filter((item) => !dateIsFuture(item.date ?? item.shiftDate));
  const selectedSchedule = eligibleSchedules.find((item) => String(item.id) === scheduleId);
  const notApplicable = scheduleId === 'not-applicable';

  async function submit() {
    if (!appealType || !title || !studentReason || (!notApplicable && !selectedSchedule)) {
      setMessage('Complete the appeal details before submitting.');
      return;
    }
    try {
      await apiFetch('/appeals', {
        method: 'POST',
        token,
        body: JSON.stringify({
          student: { id: user.id },
          instructor: notApplicable ? null : { id: selectedSchedule?.instructorId ?? selectedSchedule?.instructor?.id },
          appealType,
          relatedDutyDate: notApplicable ? null : selectedSchedule?.date ?? selectedSchedule?.shiftDate,
          clinicalSite: notApplicable ? 'Not Applicable' : selectedSchedule?.hospital,
          dutyArea: notApplicable ? 'Not Applicable' : selectedSchedule?.area ?? selectedSchedule?.ward,
          title,
          studentReason,
          evidenceNotes,
          supportingFiles: '',
        }),
      });
      setAppealType('');
      setTitle('');
      setStudentReason('');
      setEvidenceNotes('');
      setMessage('Appeal submitted for CI recommendation.');
      refresh();
    } catch {
      setMessage('Appeal could not be submitted.');
    }
  }

  return (
    <View style={styles.stack}>
      <Panel title="Appeal Details" badge="Draft">
        <Field label="Appeal Type" value={appealType} onChangeText={setAppealType} />
        <Text style={styles.label}>Related Duty Date</Text>
        <View style={styles.chipRow}>
          <Chip label="Not Applicable" active={notApplicable} onPress={() => setScheduleId('not-applicable')} />
          {eligibleSchedules.slice(0, 8).map((item) => <Chip key={item.id} label={`${shortDate(item.date ?? item.shiftDate)} - ${item.area ?? item.ward ?? 'Duty'}`} active={scheduleId === String(item.id)} onPress={() => setScheduleId(String(item.id))} />)}
        </View>
        <ReadOnly label="Clinical Site" value={notApplicable ? 'Not Applicable' : selectedSchedule?.hospital ?? 'Select a duty date'} />
        <ReadOnly label="Duty Area" value={notApplicable ? 'Not Applicable' : selectedSchedule?.area ?? selectedSchedule?.ward ?? 'Select a duty date'} />
        <Field label="Title" value={title} onChangeText={setTitle} />
        <Field label="Student Reason" value={studentReason} onChangeText={setStudentReason} multiline />
        <Field label="Evidence Notes" value={evidenceNotes} onChangeText={setEvidenceNotes} multiline />
        <PrimaryButton label="Submit Appeal" onPress={submit} />
      </Panel>
      {appeals.map((record, index) => <RecordCard key={record.id ?? index} record={record} route={{ key: 'appeals', label: 'Student Appeals', description: '' }} token={token} onChanged={refresh} setMessage={setMessage} />)}
    </View>
  );
}
