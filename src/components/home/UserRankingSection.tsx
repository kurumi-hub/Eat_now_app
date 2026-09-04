"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import StarsIcon from "@mui/icons-material/Stars";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import {
  rankingDataByPeriod,
  type RankingPeriod,
  type RankingUser,
} from "./rankingData";

export default function UserRankingSection() {
  const [activePeriod, setActivePeriod] = useState<RankingPeriod>("week");
  const [isFullLeaderboardOpen, setIsFullLeaderboardOpen] = useState(false);

  const currentData = rankingDataByPeriod[activePeriod];
  const [rank2, rank1, rank3] = currentData.top3;

  return (
    <section className="relative rounded-2xl bg-gradient-to-r from-orange-50/70 via-[#fff8f5] to-orange-50/70 border border-[#ddc1b4]/60 p-5 sm:p-6 md:p-8 shadow-sm overflow-hidden scroll-mt-24">
      {/* ── Header with Badges and Tabs ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-7 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#af2900]/10 text-[#af2900] text-xs font-semibold mb-2 shadow-xs">
            <MilitaryTechIcon className="!text-[16px]" />
            <span>{currentData.badgeLabel}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#af2900] flex items-center gap-2">
            <span>🏆</span> Bảng Vàng Thực Khách Sành Ăn
          </h2>
          <p className="text-xs sm:text-sm text-[#5a4136] mt-1">
            Vinh danh những tín đồ ẩm thực tích cực nhất tuần qua tại EatNow cùng ưu đãi đặc quyền!
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex p-1 bg-[#eeeef0] rounded-full border border-[#ddc1b4]/50 self-start md:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setActivePeriod("week")}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
              activePeriod === "week"
                ? "bg-[#7a3000] text-white font-semibold shadow-sm"
                : "text-[#5a4136] hover:text-[#7a3000] font-medium"
            }`}
          >
            Tuần này
          </button>
          <button
            type="button"
            onClick={() => setActivePeriod("month")}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
              activePeriod === "month"
                ? "bg-[#7a3000] text-white font-semibold shadow-sm"
                : "text-[#5a4136] hover:text-[#7a3000] font-medium"
            }`}
          >
            Tháng này
          </button>
          <button
            type="button"
            onClick={() => setActivePeriod("all")}
            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition-all duration-200 cursor-pointer ${
              activePeriod === "all"
                ? "bg-[#7a3000] text-white font-semibold shadow-sm"
                : "text-[#5a4136] hover:text-[#7a3000] font-medium"
            }`}
          >
            Mọi thời đại
          </button>
        </div>
      </div>

      {/* ── Top 3 Podium Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8 items-end">
        {/* Rank 2: Bạc (Order 2 on mobile, Order 1 on Desktop) */}
        <PodiumCard
          user={rank2}
          rankBadge="🥈 Top 2 Bạc"
          rankNumberBadge="#2"
          borderColor="border-[#ddc1b4]"
          avatarBorderColor="border-slate-300"
          numberBadgeClass="bg-[#f0f0f3] text-[#5a4136] border border-[#ddc1b4]"
          titleBadgeClass="bg-[#ffd3c6]/60 text-[#7a594f]"
          orderClass="order-2 md:order-1"
        />

        {/* Rank 1: Quán Quân Tuần (Order 1 on mobile, Order 2 on Desktop - Center Champion) */}
        <div className="bg-white rounded-2xl p-6 border-2 border-[#af2900]/40 shadow-xl flex flex-col items-center text-center relative hover:shadow-2xl transition-all duration-300 group order-1 md:order-2 transform md:-translate-y-2 bg-gradient-to-b from-[#af2900]/5 via-white to-white">
          <div className="absolute -top-4 px-4 py-1 rounded-full bg-[#af2900] text-white text-xs font-bold shadow-md flex items-center gap-1.5">
            <span>👑</span>
            <span>Quán Quân {activePeriod === "month" ? "Tháng" : activePeriod === "all" ? "Mọi Thời Đại" : "Tuần"}</span>
          </div>

          <div className="relative mt-3 mb-3">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-3 border-[#af2900] shadow-lg group-hover:scale-105 transition-transform bg-orange-100 flex items-center justify-center">
              {rank1.avatarUrl ? (
                <img
                  src={rank1.avatarUrl}
                  alt={rank1.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-[#af2900]">{rank1.initials}</span>
              )}
            </div>
            <span className="absolute -bottom-1 right-0 bg-[#af2900] text-white text-[11px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
              #1
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#1a1c1e]">{rank1.name}</h3>
          <div className="inline-block bg-[#af2900]/15 text-[#af2900] text-xs font-bold px-2.5 py-0.5 rounded-full my-1.5 shadow-2xs">
            {rank1.badgeTitle}
          </div>
          <div className="text-[11px] text-[#5a4136] mb-3.5 font-medium">{rank1.preference}</div>

          <div className="w-full pt-3 border-t border-[#af2900]/20 flex justify-between items-center text-xs bg-[#af2900]/5 p-2.5 rounded-xl">
            <div className="text-left">
              <div className="text-[#5a4136] text-[11px]">Tổng tích lũy</div>
              <div className="font-bold text-[#af2900] text-sm sm:text-[15px]">{rank1.orderCountLabel}</div>
            </div>
            <div className="text-right">
              <div className="text-[#5a4136] text-[11px]">Đặc quyền</div>
              <div className="font-bold text-[#af2900] text-[11px]">
                {rank1.privilegeHighlight ?? rank1.reward}
              </div>
            </div>
          </div>
        </div>

        {/* Rank 3: Đồng (Order 3 on mobile and desktop) */}
        <PodiumCard
          user={rank3}
          rankBadge="🥉 Top 3 Đồng"
          rankNumberBadge="#3"
          borderColor="border-[#ddc1b4]"
          avatarBorderColor="border-[#ffd3c6]"
          numberBadgeClass="bg-[#f0f0f3] text-[#5a4136] border border-[#ddc1b4]"
          titleBadgeClass="bg-[#ffd3c6]/60 text-[#7a594f]"
          orderClass="order-3 md:order-3"
        />
      </div>

      {/* ── Leaderboard Rows (#4 to #6) & Mini CTA ── */}
      <div className="bg-white rounded-xl border border-[#ddc1b4] p-4 shadow-sm space-y-3">
        <div className="text-xs font-semibold text-[#5a4136] uppercase tracking-wider px-2 pb-1 border-b border-[#ddc1b4]/50 flex justify-between items-center">
          <span>Thực khách theo sát (Hạng #4 - #6)</span>
          <button
            type="button"
            onClick={() => setIsFullLeaderboardOpen(true)}
            className="text-[11px] text-[#af2900] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>Xem toàn bộ bảng xếp hạng</span>
            <ArrowForwardIcon className="!text-[13px]" />
          </button>
        </div>

        {/* Chaser Rows */}
        <div className="space-y-1">
          {currentData.chasers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#fff8f5] transition-colors"
            >
              <div className="flex items-center gap-3 sm:gap-3.5">
                <span className="w-6 text-center font-bold text-[#5a4136] text-sm">
                  #{user.rank}
                </span>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#ddc1b4] bg-orange-50 flex items-center justify-center flex-shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-[#af2900]">{user.initials}</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-[#1a1c1e]">{user.name}</div>
                  <div className="text-[11px] text-[#5a4136] flex items-center gap-1.5">
                    <span className="inline-block px-1.5 py-0.5 bg-[#f0f0f3] rounded text-[#af2900] text-[10px] font-medium">
                      {user.preference}
                    </span>
                    {user.location && <span>• {user.location}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 text-right">
                <div>
                  <div className="font-bold text-[#af2900] text-sm">{user.orderCountLabel}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">{user.reward}</div>
                </div>
                <ChevronRightIcon className="!text-[#5a4136] !text-sm" />
              </div>
            </div>
          ))}
        </div>

        {/* Personal Status & Motivation Banner */}
        <div className="mt-3 pt-3 border-t border-[#ddc1b4]/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#af2900]/5 p-3 rounded-xl">
          <div className="flex items-center gap-2.5 text-xs text-[#1a1c1e]">
            <StarsIcon className="!text-[#af2900] !text-[20px] shrink-0" />
            <span>
              Bạn đang ở hạng <strong>#{currentData.personalStatus.rank}</strong> {activePeriod === "month" ? "tháng" : activePeriod === "all" ? "toàn thời gian" : "tuần"} này! Đặt thêm{" "}
              <strong>{currentData.personalStatus.neededOrders} đơn</strong> để lọt Top {currentData.personalStatus.targetRank} và nhận ngay voucher{" "}
              <strong>{currentData.personalStatus.potentialReward}</strong>.
            </span>
          </div>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#af2900] text-white text-xs font-semibold hover:bg-[#891e00] transition-colors shadow-sm whitespace-nowrap active:scale-95"
          >
            <span>Đặt món ngay</span>
            <ArrowForwardIcon className="!text-[13px]" />
          </Link>
        </div>
      </div>

      {/* ── Full Leaderboard Dialog (Modal) ── */}
      <Dialog
        open={isFullLeaderboardOpen}
        onClose={() => setIsFullLeaderboardOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: "16px",
              backgroundColor: "#ffffff",
            },
          },
        }}
      >
        <DialogTitle className="flex justify-between items-center border-b border-[#ddc1b4] pb-3">
          <div className="flex items-center gap-2">
            <EmojiEventsIcon className="!text-[#af2900] !text-2xl" />
            <span className="font-bold text-lg text-[#af2900]">
              Bảng Xếp Hạng Thực Khách Top 10
            </span>
          </div>
          <IconButton
            size="small"
            onClick={() => setIsFullLeaderboardOpen(false)}
            aria-label="Đóng"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-4 space-y-2">
          <div className="space-y-1.5 mt-2">
            {(currentData.fullLeaderboard.length > 0
              ? currentData.fullLeaderboard
              : [...currentData.top3, ...currentData.chasers]
            ).map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all ${
                  user.rank <= 3
                    ? "bg-orange-50/70 border border-orange-200 font-semibold"
                    : "hover:bg-[#fff8f5] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 text-center font-bold text-sm ${
                      user.rank === 1
                        ? "text-amber-500 font-extrabold text-base"
                        : user.rank === 2
                        ? "text-slate-500 font-extrabold"
                        : user.rank === 3
                        ? "text-amber-700 font-extrabold"
                        : "text-[#5a4136]"
                    }`}
                  >
                    #{user.rank}
                  </span>
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-[#ddc1b4] bg-orange-50 flex items-center justify-center flex-shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-[#af2900]">{user.initials}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1a1c1e] flex items-center gap-1.5">
                      <span>{user.name}</span>
                      {user.rank === 1 && <span>👑</span>}
                    </div>
                    <div className="text-[11px] text-[#5a4136]">
                      {user.preference} {user.location ? `• ${user.location}` : ""}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-[#af2900] text-xs sm:text-sm">{user.orderCountLabel}</div>
                  <div className="text-[10px] text-emerald-600 font-semibold">{user.reward}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#ddc1b4] text-center">
            <p className="text-xs text-[#5a4136]">
              Bảng xếp hạng được cập nhật liên tục dựa trên số lượng đơn hàng hoàn thành thành công.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ── Podium Card Component for Rank 2 and Rank 3 ──
interface PodiumCardProps {
  user: RankingUser;
  rankBadge: string;
  rankNumberBadge: string;
  borderColor: string;
  avatarBorderColor: string;
  numberBadgeClass: string;
  titleBadgeClass: string;
  orderClass: string;
}

function PodiumCard({
  user,
  rankBadge,
  rankNumberBadge,
  avatarBorderColor,
  numberBadgeClass,
  titleBadgeClass,
  orderClass,
}: PodiumCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-[#ddc1b4] shadow-md flex flex-col items-center text-center relative hover:shadow-xl transition-shadow group ${orderClass}`}
    >
      <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-[#f5e5dd] border border-[#ddc1b4] text-[#221a15] text-[12px] font-bold shadow-sm flex items-center gap-1">
        {rankBadge}
      </div>

      <div className="relative mt-2 mb-3">
        <div
          className={`w-18 h-18 rounded-full overflow-hidden border-2 ${avatarBorderColor} shadow-md group-hover:scale-105 transition-transform bg-orange-50 flex items-center justify-center`}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-base font-bold text-[#7a3000]">{user.initials}</span>
          )}
        </div>
        <span
          className={`absolute -bottom-1 -right-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full shadow-sm ${numberBadgeClass}`}
        >
          {rankNumberBadge}
        </span>
      </div>

      <h3 className="text-base font-bold text-[#1a1c1e]">{user.name}</h3>
      <div className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full my-1.5 ${titleBadgeClass}`}>
        {user.badgeTitle}
      </div>
      <div className="text-[11px] text-[#5a4136] mb-3">{user.preference}</div>

      <div className="w-full pt-3 border-t border-[#ddc1b4]/60 flex justify-between items-center text-xs">
        <div className="text-left">
          <div className="text-[#5a4136] text-[11px]">Đã đặt</div>
          <div className="font-bold text-[#af2900] text-[14px]">{user.orderCountLabel}</div>
        </div>
        <div className="text-right">
          <div className="text-[#5a4136] text-[11px]">Quà tặng</div>
          <div className="font-semibold text-emerald-600 text-[11px]">{user.reward}</div>
        </div>
      </div>
    </div>
  );
}
