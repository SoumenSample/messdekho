import { Link } from "react-router-dom";
import { ArrowLeft, CircleHelp, History, LifeBuoy, MessageSquare, ShieldCheck } from "lucide-react";
// Logo image located in the public folder (served from root)
const messDekhoLogo = "/messdekho-logo.png";

const QUICK_CATEGORIES = [
  "Finding PG in my city",
  "Booking and check-in help",
  "Payment and refund queries",
  "Food and facilities details",
];

const SupportSidebar = ({ previousChats = [], onSelectCategory }) => {
  return (
    <aside className="support-sidebar">
      <div className="support-sidebar-brand">
        <img src={messDekhoLogo} alt="MessDekho" className="sidebar-logo" />
      </div>

      <div className="support-sidebar-section">
        <div className="support-section-title">
          <History className="h-4 w-4" />
          Previous chats
        </div>
        <div className="support-list">
          {previousChats.length === 0 ? (
            <div className="support-list-empty">No previous chats yet</div>
          ) : (
            previousChats.map((chat, index) => (
              <button
                key={`${chat}-${index}`}
                type="button"
                className="support-list-item"
                onClick={() => onSelectCategory?.(chat)}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{chat}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="support-sidebar-section">
        <div className="support-section-title">
          <LifeBuoy className="h-4 w-4" />
          Quick categories
        </div>
        <div className="support-list">
          {QUICK_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className="support-list-item"
              onClick={() => onSelectCategory?.(item)}
            >
              <CircleHelp className="h-4 w-4" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="support-sidebar-footer">
        <div className="support-security-note">
          <ShieldCheck className="h-4 w-4" />
          Secure AI conversation
        </div>
        <Link to="/" className="support-back-btn">
          <ArrowLeft className="h-4 w-4" />
          Back to homepage
        </Link>
      </div>
    </aside>
  );
};

export default SupportSidebar;
