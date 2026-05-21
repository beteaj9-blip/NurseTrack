import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { api } from '../../api/axiosConfig';
import { Clock, CheckCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const toDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export const ManualBackupScreen = () => {
  const { user } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [site, setSite] = useState('');
  const [area, setArea] = useState('');
  const [instructor, setInstructor] = useState('');
  const [timeIn, setTimeIn] = useState('07:00');
  const [timeOut, setTimeOut] = useState('15:00');
  const [notes, setNotes] = useState('');
  
  const [totalHours, setTotalHours] = useState('8.0 hrs');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setInstructor(user?.fullName ?? '');
  }, [user?.fullName]);

  // Recalculate total hours when timeIn or timeOut changes
  useEffect(() => {
    try {
      const [inH, inM] = timeIn.split(':').map(Number);
      const [outH, outM] = timeOut.split(':').map(Number);
      
      if (!isNaN(inH) && !isNaN(inM) && !isNaN(outH) && !isNaN(outM)) {
        let diffMins = (outH * 60 + outM) - (inH * 60 + inM);
        if (diffMins < 0) diffMins += 24 * 60; // handle overnight shifts
        const hrs = diffMins / 60;
        setTotalHours(`${hrs.toFixed(1)} hrs`);
      }
    } catch {
      setTotalHours('0.0 hrs');
    }
  }, [timeIn, timeOut]);

  const handleSubmit = async () => {
    const parsedStudentId = Number(studentId);
    if (!studentId || Number.isNaN(parsedStudentId) || !date || !site || !area || !instructor || !timeIn || !timeOut || !user?.id) {
      Alert.alert('Validation Error', 'Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        student: { id: parsedStudentId },
        instructor: { id: user.id },
        hospital: site,
        ward: area,
        timeIn: `${date}T${timeIn}:00`,
        timeOut: `${date}T${timeOut}:00`,
        instructorFeedback: notes,
      };
      
      await api.post('/duties/manual', payload);
      setSubmitSuccess(true);
    } catch (e) {
      console.log('Manual duty submission failed', e);
      Alert.alert('Submission Failed', 'The duty entry was not submitted. Please check the details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDate(toDateKey(new Date()));
    setStudentId('');
    setSite('');
    setArea('');
    setInstructor(user?.fullName ?? '');
    setTimeIn('07:00');
    setTimeOut('15:00');
    setNotes('');
    setSubmitSuccess(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Title Header */}
      <View style={styles.headerPanel}>
        <Text style={styles.subTitle}>DUTY ENTRY BACKUP</Text>
        <Text style={styles.mainTitle}>Record Duty Hours</Text>
        <Text style={styles.descText}>
          Enter the completed duty details and submit the record for clinical instructor validation.
        </Text>
      </View>

      {submitSuccess ? (
        <View style={styles.successContainer}>
          <CheckCircle color="#10B981" size={56} style={{ marginBottom: 16 }} />
          <Text style={styles.successTitle}>Duty Entry Submitted</Text>
          <Text style={styles.successText}>
            Your manual duty record has been submitted and is currently pending verification from {instructor}.
          </Text>
          
          <View style={styles.receipt}>
            <Text style={styles.receiptHeading}>ENTRY SUMMARY</Text>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Date:</Text><Text style={styles.receiptVal}>{date}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Site/Area:</Text><Text style={styles.receiptVal}>{site} • {area}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Instructor:</Text><Text style={styles.receiptVal}>{instructor}</Text></View>
            <View style={styles.receiptRow}><Text style={styles.receiptLabel}>Time:</Text><Text style={styles.receiptVal}>{timeIn} - {timeOut}</Text></View>
            <View style={[styles.receiptRow, { borderTopWidth: 1, borderTopColor: '#F2F4F7', paddingTop: 8, marginTop: 8 }]}><Text style={styles.receiptLabel}>Total Hours:</Text><Text style={[styles.receiptVal, { color: '#8A252C', fontWeight: '800' }]}>{totalHours}</Text></View>
          </View>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Submit Another Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formPanel}>
          <Text style={styles.formSectionTitle}>ENTRY FORM</Text>

          {/* Date Field */}
          <Text style={styles.inputLabel}>Student Database ID *</Text>
          <TextInput
            style={styles.textInput}
            value={studentId}
            onChangeText={setStudentId}
            placeholder="e.g. 12"
            keyboardType="number-pad"
          />

          <Text style={styles.inputLabel}>Duty Date (YYYY-MM-DD) *</Text>
          <TextInput 
            style={styles.textInput}
            value={date}
            onChangeText={setDate}
            placeholder="e.g. 2026-05-21"
          />

          {/* Site/Area Fields */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Clinical Site *</Text>
              <TextInput 
                style={styles.textInput}
                value={site}
                onChangeText={setSite}
                placeholder="e.g. CCMC"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Duty Area *</Text>
              <TextInput 
                style={styles.textInput}
                value={area}
                onChangeText={setArea}
                placeholder="e.g. Emergency Room"
              />
            </View>
          </View>

          {/* Instructor Field */}
          <Text style={styles.inputLabel}>Clinical Instructor *</Text>
          <TextInput 
            style={styles.textInput}
            value={instructor}
            onChangeText={setInstructor}
            placeholder="e.g. Prof. Reyes"
          />

          {/* Time In / Time Out Fields */}
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Time In (HH:MM) *</Text>
              <TextInput 
                style={styles.textInput}
                value={timeIn}
                onChangeText={setTimeIn}
                placeholder="07:00"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Time Out (HH:MM) *</Text>
              <TextInput 
                style={styles.textInput}
                value={timeOut}
                onChangeText={setTimeOut}
                placeholder="15:00"
              />
            </View>
          </View>

          {/* Hours Calculator summary */}
          <View style={styles.hoursCard}>
            <View>
              <Text style={styles.hoursLabel}>Total calculated hours</Text>
              <Text style={styles.hoursVal}>{totalHours}</Text>
            </View>
            <Clock color="#8A252C" size={24} />
          </View>

          {/* Notes Field */}
          <Text style={styles.inputLabel}>Notes / Shift Details</Text>
          <TextInput 
            style={[styles.textInput, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add notes about your completed shift rotation..."
            multiline
            numberOfLines={4}
          />

          {/* Submit Action */}
          <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Submit duty hours</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerPanel: {
    marginBottom: 20,
  },
  subTitle: {
    color: '#8A252C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  mainTitle: {
    color: '#101828',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  descText: {
    color: '#475467',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  formPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  formSectionTitle: {
    color: '#8A252C',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  inputLabel: {
    color: '#344054',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#101828',
    fontWeight: '600',
    marginBottom: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  hoursCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 14,
  },
  hoursLabel: {
    color: '#475467',
    fontSize: 11,
    fontWeight: '700',
  },
  hoursVal: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#8A252C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    padding: 16,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressTitle: {
    color: '#101828',
    fontSize: 14,
    fontWeight: '800',
  },
  progressValue: {
    color: '#8A252C',
    fontSize: 14,
    fontWeight: '800',
  },
  track: {
    height: 8,
    backgroundColor: '#F2F4F7',
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  progressDesc: {
    color: '#475467',
    fontSize: 11,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAECF0',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#101828',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  successText: {
    color: '#475467',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  receipt: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  receiptHeading: {
    color: '#667085',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  receiptLabel: {
    color: '#475467',
    fontSize: 12,
    fontWeight: '600',
  },
  receiptVal: {
    color: '#101828',
    fontSize: 12,
    fontWeight: '700',
  },
  resetBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  resetBtnText: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '700',
  },
});
