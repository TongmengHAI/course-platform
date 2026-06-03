import Avatar from "./components/props/passing-jsx/Avatar";

function Card({ name, children }) {
  return (
    <div className="card">
      <h2>{name}</h2>
      {children}
    </div>
  );
}

function CourseTitle() {
  return (
    <>
      <Card name="Katsuko Saruhashi">
        <Avatar
          size={100}
          person={{
            name: "Katsuko Saruhashi",
            imageId: "YfeOqp2",
          }}
        />
      </Card>
      <hr></hr>
      <Card name="Yukihiro Matsumoto">   
        <p>lorem ipsum dolor sit amet</p> 
      </Card>
    </>
  );
}

export default CourseTitle;
