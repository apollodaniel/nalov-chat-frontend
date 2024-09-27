import { Modal } from "react-bootstrap";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { confirmation_modals, more_actions_modal } from "../utils/constants";
import ConfirmationPopup from "./confirmation_popup";
import { logout_user } from "../utils/functions/user";
import { NavigateFunction } from "react-router-dom";

interface IProps {
  show: boolean;
  onCancel: () => void;
  navigate: NavigateFunction;
}

function HomeTreeDotsPopup({ show, navigate, onCancel }: IProps) {
  const [logoutPopupVisible, setLogoutPopupVisible] = useState(false);

  return (
    <div className="w-100 h-100">
      <Modal show={show} size="sm">
        <Modal.Header>
          <Modal.Title>{more_actions_modal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column align-items-center justify-content-center">
          <button
            className="btn btn-secondary align-self-center w-100"
            style={{ height: "50px" }}
            onClick={() => navigate("/config")}
          >
            {more_actions_modal.content.open_config_button}
          </button>
          <button
            className="btn btn-danger align-self-center mt-5"
            onClick={() => {
              setLogoutPopupVisible(true);
            }}
          >
            {more_actions_modal.content.logout_button}
          </button>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-primary align-self-center"
            onClick={() => onCancel()}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
      <ConfirmationPopup
        title={confirmation_modals.logout.title}
        content={confirmation_modals.logout.content}
        visible={logoutPopupVisible}
        onConfirm={async () => {
          setLogoutPopupVisible(false);
          await logout_user();
        }}
        onCancel={() => setLogoutPopupVisible(false)}
      />
    </div>
  );
}

export default HomeTreeDotsPopup;
