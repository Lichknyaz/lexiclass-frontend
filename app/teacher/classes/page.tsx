import { TeacherClassesPage } from "@/features/teacher/classes/teacher-classes-page";
import { classesService } from "@/services";

export default async function TeacherClassesRoute() {
  const classes = await classesService.listClasses();

  return <TeacherClassesPage initialClasses={classes} />;
}
