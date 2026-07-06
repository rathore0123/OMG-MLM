import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { Image, P } from "../../AbstractElements";
import { Welcomeletter, profile } from "../../utils/Constant";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";

import { dynamicImage } from "../../Service";
import { useState } from "react";

const WelcomeLetterPageContainer = () => {
  const [UserName, setUserName] = useState<any>(localStorage.getItem('MemberName'))
  return (
    <>
      <Breadcrumbs mainTitle={Welcomeletter} parent={profile} ChildName={Welcomeletter}/>
      <Container fluid>
        <Row>
          <Col xl="12">
            <Card>
              <CardBody>
                <div className="d-flex align-items-center gap-3 pills-blogger">
                  <div className="blog-wrapper" style={{textAlign:'center'}}>
                  <Image className="blog-img" style={{ width: '200px' }} src={dynamicImage(`logo2.png`)} alt="fxstock" />
                    <Image className="blog-img" style={{ width: '300px' }} src={dynamicImage(`CHAIRMAN’S MESSAGE.png`)} alt="CHAIRMAN’S MESSAGE" />
                  </div>
                  <div className="blog-content" style={{ padding: '20px' }}>
                    <h4 style={{marginBottom:'10px'}}>Dear {UserName},</h4>
                    <p style={{ fontSize: '18px', marginBottom: '15px' }}>
                      I am so glad that you are on this journey with us. I take immense pride in welcoming you to the passionate and compassionate community of salutary lifestyle. As an Independent Business Owner (I.B.O.), your success and rapid growth are very important to us. Always Remember, we are here to achieve our set goals and we are here to make you the real you.</p>

                    <p style={{ fontSize: '18px', marginBottom: '15px' }}> FxStock offers you world class innovative products, unique compensation plan and well experienced management. At FxStock, we are committed to bring the most unique and wonderful innovations to our consumers time to time.</p>

                    <p style={{ fontSize: '18px', marginBottom: '15px' }}> Having spent close to 17 years working across industries, I have realized that Direct Selling is indeed a very powerful tool to reach out to the target audience and FxStock leverages today’s best form of approach i.e. Community Commerce (People to People approach). With this People to People approach, you will be able to share the FxStock products, profile, mission, vision and be rewarded for doing so based on the consumption of the products from your community.</p>

                    <p style={{ fontSize: '18px', marginBottom: '15px' }}>I request all of you to familiarize yourself with the policies and procedures designed by the company. Please remember these policies are in place to protect you and our vision.</p>

                    <p style={{ fontSize: '18px', marginBottom: '15px' }}>I look forward to work with you to strive towards our vision. Together, we’ll change the world for the better. I wish you a wonderful experience in the coming years with FxStock.</p>

                    <p style={{ fontSize: '18px', marginBottom: '15px' }}>Wishing you a rewarding and more meaningful association with FxStock.</p>
                    <hr />
                    <div>
                     <div> In your success,</div>
                      <b>FxStock
                           (Founder & C.E.O.)</b>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default WelcomeLetterPageContainer;
