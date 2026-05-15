import { ManualBackupReviewDetailContent } from "@/components/features/ManualBackupReviewDetailContent";

export default function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <ManualBackupReviewDetailContent basePath="/clinical-instructor" searchParams={props.searchParams} />;
}
