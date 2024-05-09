import { Modal } from "react-native";
import { useGlobalContext } from './GlobalContext';



const SettingsModal = () => {

  const { setConnModalVisible, settinsOpened } = useGlobalContext();


  <Modal
    onShow={setConnModalVisible(false)}
    visible={settinsOpened}
  >

  </Modal>

}

export default SettingsModal;