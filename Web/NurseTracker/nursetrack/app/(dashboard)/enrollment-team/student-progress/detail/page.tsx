import { StudentProgressDetailContent } from "@/components/features/StudentProgressDetailContent";

export default function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <StudentProgressDetailContent basePath="/enrollment-team" searchParams={props.searchParams} />;
}
