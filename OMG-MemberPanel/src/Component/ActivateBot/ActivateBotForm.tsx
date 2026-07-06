import { Card, CardBody, Col, Row, Form, FormGroup, Input, Label, } from "reactstrap";
import React, { useEffect, useState, useRef } from 'react';
import { Btn } from "../../AbstractElements";
import { decryptData } from "../../utils/helper/Crypto";
import { useBotService } from '../../Service/ActivateBot/ActivateBot'
import { useSweetAlert } from '../../Context/SweetAlertContext'
import Loader from '../../CommonElements/Loader/Loader'

interface botprops {
    FXSTWalletBalance: number;
}
const ActivateBotForm = (props: any) => {
    const { refreshAction } = props;
    const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
    const [WalletType, setWalletType] = useState('GetWalletBalance')
    const [WalletBalance, setWalletBalance] = useState(0)
    const { doActivation, getFXSTWalletBalance, loading } = useBotService();
    const { showAlert, ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();

    useEffect(() => {
        
        WalletTypeChange(WalletType)
    }, [WalletType])

    const handleActivation = async () => {
        const confirmed = await ShowConfirmAlert("Buy Subscription", "Are you sure want to buy");
        if (confirmed) {
            const param = {
                ClientId: ClientID,
                WalletType: WalletType
            }
            const res = await doActivation(param);
            if (res[0].StatusCode == "1") {
                ShowSuccessAlert("Subscription Purchased Successfully");
                refreshAction(true);


            } else {
                showAlert(res[0].Msg);
            }
        } else {
            // console.log('do nothing.');
        }
    }

    const WalletTypeChange = async (value: any) => {
        const param = {
            ClientId: ClientID,
            WalletType: value,
            ActionMode: "GetWalletBalance"
        }
        const obj = {
            procName: 'ActivateBotByMember',
            Para: JSON.stringify(param),
        };
        const res = await getFXSTWalletBalance(obj);
        setWalletBalance(res[0]?.WalletBalance)
        // console.log(res);
     
    }
const getPackage=()=>{
    const obj={
        ClientId:ClientID,
        ActionMode:'Getpackage'
    }
    const param={
        Para:JSON.stringify(obj),
        procName:''
    }
}

    return (
        <Form>
            {/* {loading && <Loader />} */}
            <button className="btn-info py-2 pe-2" color="info" style={{ fontSize: '18px', textAlign: 'justify', width: '210px' }} type="button">
                Wallet Balance :
                {loading ? <div className="spinner-border text-light text-center" style={{ width: '1rem', height: '1rem' }} role="status">
                </div> : <span> &nbsp;{WalletBalance}</span>}
            </button>
            <hr />
            <Card>

                <CardBody>
                    <Row>
                        <Col md="12">
                            <FormGroup>
                                <Label>Wallet Type</Label>
                                <select className=" form-control btn-square form-select" onChange={(e) => setWalletType(e.target.value)}>
                                    {/* <option value="FXSTWallet">FXST Wallet</option> */}
                                    <option value="ProductWallet">Deposit Wallet</option>
                                </select>
                            </FormGroup>
                            <FormGroup>
                                <Label>Subscription Fee</Label>
                                <Input type="text" placeholder="Activation Fee" value={25} disabled />
                            </FormGroup>
                            <div><span className="badge badge-danger" style={{ fontSize: '18px' }}><i className="fa fa-user"></i>   <span> {localStorage.getItem("MemberName")}</span></span></div>
                        </Col>
                        <Col md="4">
                        <button className="form-btn rounded mt33"  style={{ marginTop: '30px' }} type="button"  onClick={handleActivation}>Activate</button>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Form>

    );
};

export default ActivateBotForm;
