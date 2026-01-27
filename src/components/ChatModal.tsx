import { Button, Input, Typography } from "antd";
import {
  CalendarOutlined,
  CloseOutlined,
  EllipsisOutlined,
  PaperClipOutlined,
  PictureOutlined,
  SearchOutlined,
  SendOutlined
} from "@ant-design/icons";
import { avatarAhmed, avatarJane, backgroundOverlay } from "../figmaAssets";
import "../styles.css";

const { Text } = Typography;

export default function ChatModal() {
  return (
    <div className="screen">
      <img className="screen__bg" src={backgroundOverlay} alt="" />

      <div className="modal">
        <button className="modal__close" type="button" aria-label="Close">
          <CloseOutlined />
        </button>

        <div className="modal__content">
          <div className="modal__left">
            <div className="search">
              <SearchOutlined className="search__icon" />
              <Input
                className="search__input"
                placeholder="Search by name"
                bordered={false}
              />
            </div>

            <div className="contact contact--active">
              <img className="contact__avatar" src={avatarJane} alt="" />
              <div className="contact__info">
                <div className="contact__row">
                  <Text className="contact__name">0214</Text>
                  <Text className="contact__time">just now</Text>
                </div>
                <Text className="contact__preview">
                  Thanks Jane! Let&apos;s schedule a meet so...
                </Text>
                <div className="contact__tag contact__tag--active">
                  <span>⚡</span>
                  <span>1 active offer</span>
                </div>
              </div>
            </div>

            <div className="contact contact--secondary">
              <img className="contact__avatar" src={avatarAhmed} alt="" />
              <div className="contact__info">
                <div className="contact__row">
                  <Text className="contact__name">韩不改（重生版</Text>
                  <Text className="contact__time">12h ago</Text>
                </div>
                <Text className="contact__preview">
                  Sent you an offer to help you...
                </Text>
                <div className="contact__tag contact__tag--secondary">
                  <span>↺</span>
                  <span>修改过1次</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal__divider" />

          <div className="modal__right">
            <div className="conversation__header">
              <img className="conversation__avatar" src={avatarAhmed} alt="" />
              <div className="conversation__title">
                <Text className="conversation__name">韩不改（重生版</Text>
              </div>
              <EllipsisOutlined className="conversation__menu" />
            </div>

            <div className="offer-card">
              <Text className="offer-card__title">
                Portfolio + Resume Help 🔆 500 BTRST
              </Text>
              <div className="offer-card__actions">
                <Button className="offer-card__btn offer-card__btn--ghost">
                  Decline
                </Button>
                <Button className="offer-card__btn offer-card__btn--primary">
                  Accept
                </Button>
              </div>
            </div>

            <Text className="conversation__timestamp">Yesterday 9:19 PM</Text>

            <div className="message message--incoming">
              <Text className="message__title">Hi Alex</Text>
              <Text className="message__body">
                Thank you for reaching out to me! I can definitely provide
                insights on creating a portfolio for UI/UX designers. Having a
                website for your portfolio can be extremely helpful in today&apos;s
                job market because it allows recruiters to explore your work
                interactively and gives you more control over how you present
                your skills. Although a PDF is a great start, having a website
                may give you an added advantage, as it demonstrates your ability
                to design for the web as well.
              </Text>
              <Text className="message__body message__body--spaced">
                I&apos;d be happy to help guide you through creating a premium
                portfolio website that aligns with your expertise and
                effectively showcases your strengths. Feel free to reach out to
                me if you need help!
              </Text>
            </div>

            <Text className="conversation__timestamp conversation__timestamp--center">
              Yesterday 9:20 PM
            </Text>

            <div className="composer">
              <Text className="composer__placeholder">Send a message...</Text>
              <div className="composer__icons">
                <PictureOutlined />
                <PaperClipOutlined />
                <CalendarOutlined />
                <Button className="composer__offer">Offer 1:1 help</Button>
              </div>
              <Button className="composer__send" icon={<SendOutlined />}>
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
