import * as Yup from 'yup';


export const ModalForm_validSchema = Yup.object({
    QueryType: Yup.string().required('Query Type is Required'),
    Title: Yup.string().required('Title is Required'),
    Description: Yup.string().optional(),
  });

export const ChatModal_FormSchema = Yup.object({
  Comment:Yup.string().required('Please fill input field')
})