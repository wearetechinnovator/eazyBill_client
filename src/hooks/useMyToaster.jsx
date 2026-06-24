import { Message, useToaster } from "rsuite";

const useMyToaster = () => {
  const toaster = useToaster();


  const toast = (msg, type) => {
    const message = (
      <Message
        showIcon
        type={type}
        closable
        style={{
          border: "1px solid orange"
        }}
      >
        {msg}
      </Message>
    );

    toaster.push(message, {
      duration: 2000,
      placement: "topEnd",
    });

  }

  return toast;
}

export default useMyToaster;
