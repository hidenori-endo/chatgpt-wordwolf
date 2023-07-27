import { useContext } from "react";
import { DataContext } from "../App";

const Modal = () => {
  // useContext
  const { modalVisible, setModalVisible, buttonVisible, setButtonVisible } =
    useContext(DataContext);

  // モーダル非表示
  const modalClick = async () => {
    setButtonVisible(!buttonVisible);
  };

  return (
    <>
      {modalVisible && (
        <div className="modal">
          {buttonVisible && (
            <button
              onClick={() => {
                modalClick();
              }}
              className="btn btn-light"
            >
              お題を生成
            </button>
          )}
          {!buttonVisible && (
            <div className="spinner-border text-light mx-auto" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Modal;
