import { redirect } from "next/navigation";

export default function ProfileEditRedirect() {
  redirect("/coordinator/profile");
}
