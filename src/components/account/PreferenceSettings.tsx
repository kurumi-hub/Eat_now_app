"use client";

import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import RestaurantMenuOutlinedIcon from "@mui/icons-material/RestaurantMenuOutlined";
import { Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Switch } from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";

type Preferences = { language: string; theme: string; diet: string[]; allergies: string[]; orderNotifications: boolean; promotionNotifications: boolean; recommendationNotifications: boolean; chatbotPersonalization: boolean; saveChatHistory: boolean };
const STORAGE_KEY = "eatnow-account-preferences";
const initialPreferences: Preferences = { language: "vi", theme: "system", diet: [], allergies: [], orderNotifications: true, promotionNotifications: true, recommendationNotifications: true, chatbotPersonalization: true, saveChatHistory: true };
const dietOptions = ["Ăn chay", "Thuần chay", "Ăn kiêng", "Halal"];
const allergyOptions = ["Đậu phộng", "Hải sản", "Sữa", "Trứng", "Gluten"];

export default function PreferenceSettings() {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [saved, setSaved] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const parsed = JSON.parse(stored);
      timer = setTimeout(() => setPreferences({ ...initialPreferences, ...parsed }), 0);
    }
    catch { window.localStorage.removeItem(STORAGE_KEY); }
    return () => { if (timer) clearTimeout(timer); };
  }, []);

  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) => { setSaved(false); setPreferences((current) => ({ ...current, [key]: value })); };
  const toggleListValue = (key: "diet" | "allergies", value: string) => { const values = preferences[key]; update(key, values.includes(value) ? values.filter((item) => item !== value) : [...values, value]); };
  const savePreferences = () => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences)); setSaved(true); };
  const clearChatHistory = () => { window.localStorage.removeItem("eatnow-chat-history"); setClearDialogOpen(false); };

  return (
    <div className="settings-stack">
      {saved ? <Alert severity="success" onClose={() => setSaved(false)}>Đã lưu cài đặt trên thiết bị này.</Alert> : null}
      <section className="settings-card" aria-labelledby="display-settings-title">
        <SettingsHeading icon={<LanguageOutlinedIcon />} title="Ngôn ngữ và giao diện" description="Chọn ngôn ngữ và cách EatNow hiển thị trên thiết bị này." id="display-settings-title" />
        <div className="settings-form-grid">
          <FormControl fullWidth size="small"><InputLabel id="language-label">Ngôn ngữ</InputLabel><Select labelId="language-label" label="Ngôn ngữ" value={preferences.language} onChange={(event) => update("language", event.target.value)}><MenuItem value="vi">Tiếng Việt</MenuItem><MenuItem value="en">English</MenuItem></Select></FormControl>
          <FormControl fullWidth size="small"><InputLabel id="theme-label">Giao diện</InputLabel><Select labelId="theme-label" label="Giao diện" value={preferences.theme} onChange={(event) => update("theme", event.target.value)}><MenuItem value="system">Theo hệ thống</MenuItem><MenuItem value="light">Sáng</MenuItem><MenuItem value="dark">Tối</MenuItem></Select></FormControl>
        </div>
      </section>
      <section className="settings-card" aria-labelledby="food-settings-title">
        <SettingsHeading icon={<RestaurantMenuOutlinedIcon />} title="Tùy chọn ăn uống và dị ứng" description="Giúp EatNow lọc và gợi ý món phù hợp hơn với bạn." id="food-settings-title" />
        <PreferenceChips label="Chế độ ăn" options={dietOptions} selected={preferences.diet} onToggle={(value) => toggleListValue("diet", value)} />
        <PreferenceChips label="Dị ứng cần lưu ý" options={allergyOptions} selected={preferences.allergies} onToggle={(value) => toggleListValue("allergies", value)} />
        <p className="settings-helper">Luôn kiểm tra lại thành phần với nhà hàng nếu bạn có dị ứng nghiêm trọng.</p>
      </section>
      <section className="settings-card" aria-labelledby="notification-settings-title">
        <SettingsHeading icon={<NotificationsNoneOutlinedIcon />} title="Quản lý thông báo" description="Chọn những cập nhật bạn muốn nhận từ EatNow." id="notification-settings-title" />
        <div className="settings-switch-list">
          <SettingSwitch label="Trạng thái đơn hàng" description="Cập nhật xác nhận, chuẩn bị và giao đơn." checked={preferences.orderNotifications} onChange={(checked) => update("orderNotifications", checked)} />
          <SettingSwitch label="Khuyến mãi và ưu đãi" description="Mã giảm giá và chương trình mới." checked={preferences.promotionNotifications} onChange={(checked) => update("promotionNotifications", checked)} />
          <SettingSwitch label="Gợi ý dành cho bạn" description="Món ăn và nhà hàng phù hợp với sở thích." checked={preferences.recommendationNotifications} onChange={(checked) => update("recommendationNotifications", checked)} />
        </div>
      </section>
      <section className="settings-card settings-card--chatbot" aria-labelledby="chatbot-settings-title">
        <SettingsHeading icon={<AutoAwesomeOutlinedIcon />} title="Chatbot và cá nhân hóa" description="Kiểm soát dữ liệu chatbot được phép dùng và lưu lại." id="chatbot-settings-title" />
        <div className="settings-switch-list">
          <SettingSwitch label="Cho phép sử dụng sở thích ăn uống" description="Dùng chế độ ăn và dị ứng đã chọn để tìm món phù hợp." checked={preferences.chatbotPersonalization} onChange={(checked) => update("chatbotPersonalization", checked)} />
          <SettingSwitch label="Lưu lịch sử trò chuyện" description="Giúp chatbot tiếp tục ngữ cảnh ở lần trò chuyện sau." checked={preferences.saveChatHistory} onChange={(checked) => update("saveChatHistory", checked)} />
        </div>
        <div className="settings-inline-action"><div><strong>Xóa lịch sử trò chuyện</strong><span>Xóa các cuộc hội thoại đã lưu trên thiết bị.</span></div><Button color="error" variant="text" startIcon={<DeleteSweepOutlinedIcon />} onClick={() => setClearDialogOpen(true)}>Xóa lịch sử</Button></div>
      </section>
      <div className="settings-save-bar"><span>Các thay đổi chỉ được áp dụng sau khi lưu.</span><Button variant="contained" onClick={savePreferences}>Lưu cài đặt</Button></div>
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)} fullWidth maxWidth="xs"><DialogTitle>Xóa lịch sử trò chuyện?</DialogTitle><DialogContent>Lịch sử trò chuyện đã lưu trên thiết bị này sẽ bị xóa và không thể khôi phục.</DialogContent><DialogActions><Button onClick={() => setClearDialogOpen(false)}>Hủy</Button><Button color="error" variant="contained" onClick={clearChatHistory}>Xóa lịch sử</Button></DialogActions></Dialog>
    </div>
  );
}

function SettingsHeading({ icon, title, description, id }: { icon: ReactNode; title: string; description: string; id: string }) { return <div className="settings-card__heading"><span className="settings-card__icon">{icon}</span><div><h2 id={id}>{title}</h2><p>{description}</p></div></div>; }
function PreferenceChips({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) { return <div className="settings-chip-group"><span className="settings-field-label">{label}</span><div>{options.map((option) => <Chip key={option} label={option} clickable variant={selected.includes(option) ? "filled" : "outlined"} color={selected.includes(option) ? "primary" : "default"} onClick={() => onToggle(option)} aria-pressed={selected.includes(option)} />)}</div></div>; }
function SettingSwitch({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="settings-switch-row"><span><strong>{label}</strong><small>{description}</small></span><Switch checked={checked} onChange={(event) => onChange(event.target.checked)} slotProps={{ input: { "aria-label": label } }} /></label>; }
