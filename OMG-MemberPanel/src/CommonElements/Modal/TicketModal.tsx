import React, { useEffect, useState, useRef } from "react";
import { Btn, P } from "../../AbstractElements";
import {
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Col,
  Label
} from "reactstrap";
import { Formik, Field, Form, ErrorMessage } from "formik";
import {
  TicketData,
  ChatForm_Data
} from "./DataType/ModalType";
import {
  ModalForm_validSchema,
  ChatModal_FormSchema
} from "./FormSchema/FormSchema";
import { decryptData } from "../../utils/helper/Crypto";
import { useSweetAlert } from "../../Context/SweetAlertContext";
import { ApiService } from "../../Service/UniversalService/ApiService";

function TicketModal(props: any) {

  const {
    btnName,
    className,
    GetTicketCount,
    ModelName,
    ModelTitle,
    onOpen,
    modelData,
    updateListfunc,
    refreshdata,
  } = props;

  const [modal, setModal] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [ClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string)
  );

  const { universalService } = ApiService();

  const { ShowSuccessAlert } = useSweetAlert();

  const chatRef = useRef(null);

  const toggle = () => setModal(!modal);
  const fetchChatHistory = async () => {
    if (!modelData?.[0]?.TicketId) return;

    try {
      setChatLoading(true);

      const payload = {
        procName: "MemberSupportTicket",
        Para: JSON.stringify({
          ActionMode: "GetTicketById",
          TicketId: modelData[0].TicketId
        })
      };

      const res = await universalService(payload);

      const result = res?.data ?? res ?? [];
      const ticket = Array.isArray(result) ? result[0] : result;

      let chats = [];

      if (ticket?.ChatHistory) {
        chats =
          typeof ticket.ChatHistory === "string"
            ? JSON.parse(ticket.ChatHistory)
            : ticket.ChatHistory;
      }

      setChatHistory(chats || []);

    } catch (err) {
      console.error("Chat history fetch failed", err);
      setChatHistory([]);
    } finally {
      setChatLoading(false);
    }
  };
  const closeBtn = (
    <Btn
      className="close primary"
      style={{ color: "#fff", fontSize: "20px" }}
      onClick={toggle}
      type="button"
    >
      &times;
    </Btn>
  );

  /* auto scroll chat */

  useEffect(() => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);
  }, [modelData]);

  /* Create Ticket */

  const HandleSubmit = async (values: any) => {

    try {

      const param = {
        ActionMode: "RaiseTicket",
        ClientId: ClientID,
        Subject: values?.Title,
        Message: values?.Description,
        Priority: values?.QueryType,
        EntryBy: ClientID
      };

      const obj = {
        procName: "MemberSupportTicket",
        Para: JSON.stringify(param)
      };

      const res = await universalService(obj);

      toggle();
      updateListfunc();

      ShowSuccessAlert(res?.[0]?.Msg || "Ticket raised successfully");

    } catch (error) {
      console.error(error);
    }
  };

  /* Send Chat Message */

  const HandleChatonModal = async (values: any) => {

    try {

      const param = {
        ActionMode: "InsertChat",
        TicketId: modelData?.[0]?.TicketId,
        ClientId: ClientID,
        Message: values?.Comment,
        EntryBy: ClientID
      };

      const obj = {
        procName: "MemberSupportTicket",
        Para: JSON.stringify(param)
      };

      const res = await universalService(obj);

      if (Array.isArray(res) || res?.StatusCode === 1) {
        await fetchChatHistory();
        ShowSuccessAlert("Message sent successfully");
      }

      if (GetTicketCount) GetTicketCount(true);

    } catch (error) {
      console.error("Chat error", error);
    }
  };

  return (
    <div>

      <button
        className="form-btn btn"
        type="button"
        onClick={() => {
          if (ModelName === "ViewMore") {
            onOpen();
            fetchChatHistory();   // ⭐ LOAD CHAT
          }
          toggle();
        }}
      >
        {btnName}
      </button>

      <Modal isOpen={modal} toggle={toggle} className={className}>
        <ModalHeader toggle={toggle} close={closeBtn}>
          <P>{ModelTitle}</P>
        </ModalHeader>
        <ModalBody>

          {ModelName !== "ViewMore" ? (

            /* CREATE TICKET */

            <Formik
              initialValues={TicketData}
              validationSchema={ModalForm_validSchema}
              onSubmit={(values, { setSubmitting }) => {
                HandleSubmit(values);
                setSubmitting(false);
              }}
            >

              <Form>

                <Col>

                  <FormGroup>
                    <Label>Select Type</Label>

                    <Field
                      as="select"
                      name="QueryType"
                      className="form-control text-white"
                    >
                      <option value="1">Technical Issue</option>
                      <option value="2">Bonus Issue</option>
                      <option value="3">Sponsor Issue</option>
                      <option value="4">Other</option>
                    </Field>

                    <ErrorMessage
                      name="QueryType"
                      component="div"
                      className="text-danger"
                    />

                  </FormGroup>

                  <FormGroup>

                    <Label>Query Title</Label>

                    <Field
                      name="Title"
                      className="form-control text-white"
                      placeholder="Query Title"
                    />

                    <ErrorMessage
                      name="Title"
                      component="div"
                      className="text-danger"
                    />

                  </FormGroup>

                  <FormGroup>

                    <Label>Query Description</Label>

                    <Field
                      as="textarea"
                      rows={3}
                      name="Description"
                      className="form-control text-white"
                    />

                    <ErrorMessage
                      name="Description"
                      component="div"
                      className="text-danger"
                    />

                  </FormGroup>

                  <button className="form-btn rounded" type="submit">
                    Create Ticket
                  </button>

                  <button
                    className="form-btn rounded ms-2"
                    type="button"
                    onClick={toggle}
                  >
                    Cancel
                  </button>

                </Col>

              </Form>

            </Formik>

          ) : (

            /* CHAT VIEW */

            <>

              <div
                ref={chatRef}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px",
                  background: "#f9fafb",
                  overflowY: "auto",
                  height: "300px",
                  marginBottom: "15px"
                }}
              >

                {chatLoading ? (

                  <div style={{ textAlign: "center", padding: "20px" }}>
                    Loading chat...
                  </div>

                ) : chatHistory.length === 0 ? (

                  <div style={{ textAlign: "center", color: "#9ca3af" }}>
                    No conversation yet
                  </div>

                ) : (

                  chatHistory.map((itm: any, index: number) => {

                    const sender = itm?.SenderType || "User";

                    const isUser =
                      sender.toLowerCase() === "user" ||
                      sender.toLowerCase() === "client";

                    const message = itm?.Message || "-";

                    const date = itm?.CreatedDate || "";

                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: isUser ? "flex-start" : "flex-end",
                          marginBottom: "10px"
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "70%",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            background: isUser ? "#ffffff" : "#3b82f6",
                            color: isUser ? "#000" : "#fff",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                          }}
                        >
                          <div style={{ fontSize: "11px", opacity: 0.7 }}>
                            {isUser ? "You" : "Admin"}
                          </div>

                          <div style={{ wordBreak: "break-word" }}>
                            {message}
                          </div>

                          <div
                            style={{
                              fontSize: "10px",
                              opacity: 0.6,
                              textAlign: "right"
                            }}
                          >
                            {date}
                          </div>

                        </div>
                      </div>
                    );

                  })

                )}

              </div>

              {/* Send Chat */}

              <Formik
                initialValues={ChatForm_Data}
                validationSchema={ChatModal_FormSchema}
                onSubmit={(values, { resetForm }) => {
                  HandleChatonModal(values);
                  resetForm();
                }}
              >

                <Form>

                  <FormGroup>

                    <Field
                      as="textarea"
                      name="Comment"
                      className="form-control"
                      placeholder="Enter your comment"
                    />

                    <ErrorMessage
                      name="Comment"
                      component="div"
                      className="text-danger"
                    />

                  </FormGroup>

                  <button className="form-btn rounded" type="submit">
                    Send
                  </button>

                  <button
                    className="form-btn rounded ms-2"
                    type="button"
                    onClick={toggle}
                  >
                    Cancel
                  </button>

                </Form>

              </Formik>

            </>
          )}

        </ModalBody>

      </Modal>

    </div>
  );
}

export default TicketModal;