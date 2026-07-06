import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, Container, Row } from "reactstrap";
import SVG from "../SVG";
import { Image, H5 } from "../../AbstractElements";
import { PropsTypes } from "../../Type/Layout/CommonElements/Breadcrumbs";
import H3 from "../Headings/H3Element";
import Btn from "../Button";
import { FaGooglePlay } from "react-icons/fa";
import H6 from "../Headings/H6Element";
import P from "../Paragraph";
import { dynamicImage } from "../../Service";
import { useState } from "react";

const Breadcrumbs = ({ mainTitle, parent, ChildName }: PropsTypes) => {
  const [userName, setUserName] = useState(localStorage.getItem("UserName"));
  const [MemberName, setMemberName] = useState(
    localStorage.getItem("MemberName"),
  );
  return (
    <Container fluid>
      <Row className="page-title align-items-center">
        <div
          className={mainTitle === "Dashboard" ? "col-12 col-md-6" : "col-md-6"}
        >
          {mainTitle === "Dashboard" ? (
            <div className="">
              <H3>Welcome, {MemberName} 👋</H3>
              <P className="mt-1" style={{color: "var(--dash-text-2)"}}>Have a nice day!</P>
            </div>
          ) : (
            <H3>{mainTitle}</H3>
          )}
        </div>

        <div
          className={
            mainTitle === "Dashboard"
              ? "col-12 col-md-6 col-xl-6  d-none d-md-block"
              : "col-md-6 d-none d-md-block"
          }
        >
          <Breadcrumb className="justify-content-sm-end align-items-center">
            <BreadcrumbItem>
              <Link to={`${import.meta.env.BASE_URL}`}>
                <SVG iconId="Home" className="svg-color" />
              </Link>
            </BreadcrumbItem>
            <BreadcrumbItem>{parent}</BreadcrumbItem>
            {ChildName ? (
              <BreadcrumbItem className="active">{ChildName}</BreadcrumbItem>
            ) : (
              mainTitle !== "Dashboard" && (
                <BreadcrumbItem className="active">{mainTitle}</BreadcrumbItem>
              )
            )}
          </Breadcrumb>
        </div>
      </Row>
    </Container>
  );
};

export default Breadcrumbs;
