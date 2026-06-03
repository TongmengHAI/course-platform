import Button from "./components/props/passing-event/Buttons";

const alertFromApp = () => {
  alert("Alert from app");
  console.log("Alert from app");
}

function CourseTitle() {
  return (
    <>
      <Button children={alertFromApp} />
    </>
  );
}

export default CourseTitle;
