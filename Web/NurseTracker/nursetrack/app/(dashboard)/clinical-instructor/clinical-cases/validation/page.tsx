import { ClinicalCasesValidationContent } from "@/components/features/ClinicalCasesValidationContent";

export default function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <ClinicalCasesValidationContent basePath="/clinical-instructor" searchParams={props.searchParams} />;
}
