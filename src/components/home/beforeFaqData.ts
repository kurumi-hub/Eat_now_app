import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import GpsFixedOutlinedIcon from "@mui/icons-material/GpsFixedOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import QrCode2OutlinedIcon from "@mui/icons-material/QrCode2Outlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import StarsOutlinedIcon from "@mui/icons-material/StarsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import TwoWheelerOutlinedIcon from "@mui/icons-material/TwoWheelerOutlined";
import type { SvgIconComponent } from "@mui/icons-material";

export interface FaqCardItem {
  title: string;
  description: string;
  icon: SvgIconComponent;
}

export interface FaqTopicItem {
  question: string;
  cards: FaqCardItem[];
  description: string;
}

export interface FaqTabCategory {
  id: string;
  label: string;
  items: FaqTopicItem[];
}

export const beforeFaqTabsData: FaqTabCategory[] = [
  {
    id: "faq",
    label: "Câu hỏi thường gặp",
    items: [
      {
        question: "EatNow hoạt động như thế nào?",
        cards: [
          {
            title: "Đặt món!",
            description: "Chọn món yêu thích từ các nhà hàng gần bạn.",
            icon: RestaurantOutlinedIcon,
          },
          {
            title: "Theo dõi tiến độ",
            description: "Cập nhật trạng thái đơn hàng theo từng bước giao.",
            icon: RouteOutlinedIcon,
          },
          {
            title: "Nhận đơn hàng!",
            description: "Bữa ăn nóng hổi được giao tới cửa nhanh chóng.",
            icon: LocalMallOutlinedIcon,
          },
        ],
        description:
          "EatNow đơn giản hóa quy trình đặt đồ ăn. Duyệt qua thực đơn đa dạng của chúng tôi, chọn những món ăn yêu thích và tiến hành thanh toán. Bữa ăn ngon của bạn sẽ được giao đến tận cửa ngay lập tức.",
      },
      {
        question: "Những phương thức thanh toán nào được chấp nhận?",
        cards: [
          {
            title: "Tiền mặt (COD)",
            description: "Thanh toán trực tiếp bằng tiền mặt khi shipper giao đồ ăn đến tay bạn.",
            icon: PaymentsOutlinedIcon,
          },
          {
            title: "VNPAY & Thẻ ATM",
            description: "Thanh toán trực tuyến bảo mật qua cổng VNPAY, thẻ ATM nội địa & quốc tế.",
            icon: CreditCardOutlinedIcon,
          },
          {
            title: "Ví điện tử & QR",
            description: "Quét mã QR tiện lợi, hỗ trợ MoMo, ZaloPay và chuyển khoản ngân hàng 24/7.",
            icon: QrCode2OutlinedIcon,
          },
        ],
        description:
          "EatNow hỗ trợ đa dạng phương thức thanh toán linh hoạt, cam kết giao dịch an toàn và bảo mật 100% cho mọi đơn hàng của bạn.",
      },
      {
        question: "Tôi có thể theo dõi đơn hàng trong thời gian thực không?",
        cards: [
          {
            title: "Định vị GPS tài xế",
            description: "Xem vị trí tài xế và lộ trình di chuyển ngay trên bản đồ trực tiếp.",
            icon: GpsFixedOutlinedIcon,
          },
          {
            title: "Cập nhật trạng thái",
            description: "Nhận thông báo ngay khi quán nhận đơn, bắt đầu nấu và tài xế nhận đồ.",
            icon: NotificationsActiveOutlinedIcon,
          },
          {
            title: "Dự báo thời gian",
            description: "Ước tính thời gian giao hàng chuẩn xác dựa trên tình hình giao thông thực tế.",
            icon: AccessTimeOutlinedIcon,
          },
        ],
        description:
          "Hệ thống định vị thông minh của EatNow giúp bạn luôn nắm rõ lộ trình của bữa ăn từ lúc quán bắt đầu nấu đến khi shipper bấm chuông cửa.",
      },
      {
        question: "Có ưu đãi hoặc khuyến mãi đặc biệt nào không?",
        cards: [
          {
            title: "Kho voucher mỗi ngày",
            description: "Hàng ngàn mã giảm giá đến 50k, freeship mỗi ngày trên kho ưu đãi.",
            icon: LocalOfferOutlinedIcon,
          },
          {
            title: "Flash Sale khung giờ",
            description: "Săn deal món ngon giá sốc 1k, 9k trong các khung giờ vàng bữa trưa & tối.",
            icon: BoltOutlinedIcon,
          },
          {
            title: "Tích điểm đổi quà",
            description: "Tích lũy điểm sau mỗi đơn hàng để đổi voucher độc quyền và đặc quyền VIP.",
            icon: CardGiftcardOutlinedIcon,
          },
        ],
        description:
          "Đừng quên ghé mục 'Ưu đãi' và kiểm tra tài khoản mỗi ngày để không bỏ lỡ các mã giảm giá và chương trình khuyến mãi độc quyền từ EatNow!",
      },
      {
        question: "EatNow có khả dụng ở khu vực của tôi không?",
        cards: [
          {
            title: "Phủ sóng toàn thành phố",
            description: "Phục vụ rộng khắp các quận Ninh Kiều, Bình Thủy, Cái Răng và lân cận.",
            icon: LocationOnOutlinedIcon,
          },
          {
            title: "Tài xế túc trực 24/7",
            description: "Hơn 5.000 đối tác tài xế sẵn sàng nhận đơn và giao hàng bất kể thời tiết.",
            icon: TwoWheelerOutlinedIcon,
          },
          {
            title: "Gợi ý quán gần nhất",
            description: "Tự động đề xuất các nhà hàng gần nhất theo định vị để giao nhanh < 20 phút.",
            icon: StorefrontOutlinedIcon,
          },
        ],
        description:
          "EatNow liên tục mở rộng mạng lưới giao hàng đến các khu vực mới. Nhập địa chỉ của bạn ở thanh tìm kiếm để khám phá ngay danh sách quán phục vụ!",
      },
    ],
  },
  {
    id: "about",
    label: "Chúng tôi là ai?",
    items: [
      {
        question: "Sứ mệnh và Tầm nhìn của EatNow",
        cards: [
          {
            title: "Kết nối ẩm thực",
            description: "Đưa tinh hoa ẩm thực đường phố và nhà hàng địa phương tới mọi nhà.",
            icon: RestaurantOutlinedIcon,
          },
          {
            title: "Tốc độ vượt trội",
            description: "Tối ưu chuỗi cung ứng giao nhận để đồ ăn luôn nóng sốt và thơm ngon.",
            icon: BoltOutlinedIcon,
          },
          {
            title: "Khách hàng là số 1",
            description: "Trải nghiệm tiện ích, tận tâm và hỗ trợ chu đáo trong từng điểm chạm.",
            icon: StarsOutlinedIcon,
          },
        ],
        description:
          "EatNow ra đời với sứ mệnh mang đến giải pháp giao đồ ăn tiện lợi, ấm áp và đậm đà bản sắc ẩm thực Việt Nam. Chúng tôi không chỉ giao đồ ăn, chúng tôi mang niềm vui trong từng bữa ăn của bạn.",
      },
      {
        question: "Cam kết chất lượng & Vệ sinh an toàn",
        cards: [
          {
            title: "Kiểm duyệt đối tác",
            description: "100% nhà hàng được chứng nhận vệ sinh an toàn thực phẩm.",
            icon: CheckCircleOutlineOutlinedIcon,
          },
          {
            title: "Bảo quản chuẩn nhiệt",
            description: "Túi giữ nhiệt chuyên dụng giúp thức ăn luôn giữ trọn vị ngon nguyên bản.",
            icon: LocalMallOutlinedIcon,
          },
          {
            title: "Giá niêm yết chuẩn",
            description: "Cam kết giá món trên ứng dụng minh bạch và đồng nhất với tại quán.",
            icon: PaymentsOutlinedIcon,
          },
        ],
        description:
          "Mỗi đối tác quán ăn trên EatNow đều trải qua quy trình đánh giá nghiêm ngặt, cam kết mang đến những bữa ăn an toàn, vệ sinh và bổ dưỡng nhất.",
      },
      {
        question: "Công nghệ tiên tiến & Trợ lý FoodBot AI",
        cards: [
          {
            title: "FoodBot AI 24/7",
            description: "Gợi ý món ăn chuẩn gu theo sở thích, tâm trạng và ngân sách cá nhân.",
            icon: StarsOutlinedIcon,
          },
          {
            title: "Định tuyến thông minh",
            description: "Thuật toán AI ghép đơn và tìm đường đi tối ưu nhất cho tài xế.",
            icon: RouteOutlinedIcon,
          },
          {
            title: "Trải nghiệm mượt mà",
            description: "Giao diện hiện đại, đặt món chỉ với 3 thao tác đơn giản và nhanh gọn.",
            icon: GpsFixedOutlinedIcon,
          },
        ],
        description:
          "EatNow ứng dụng công nghệ trí tuệ nhân tạo và hệ thống xử lý dữ liệu thời gian thực, giúp trải nghiệm gọi món của bạn trở nên thú vị và tiện lợi hơn bao giờ hết.",
      },
    ],
  },
  {
    id: "partner",
    label: "Chương trình đối tác",
    items: [
      {
        question: "Hợp tác mở quán trên EatNow",
        cards: [
          {
            title: "Tăng trưởng doanh thu",
            description: "Tăng từ 150% - 300% lượng đơn hàng hàng tháng qua kênh trực tuyến.",
            icon: TrendingUpOutlinedIcon,
          },
          {
            title: "100.000+ Thực khách",
            description: "Tiếp cận cộng đồng người dùng đông đảo và trung thành tại địa phương.",
            icon: StorefrontOutlinedIcon,
          },
          {
            title: "Hệ thống quản lý",
            description: "Ứng dụng EatNow Owner quản lý thực đơn, đơn hàng và dòng tiền chuyên nghiệp.",
            icon: CreditCardOutlinedIcon,
          },
        ],
        description:
          "Mở rộng kinh doanh ẩm thực không giới hạn mặt bằng cùng EatNow. Đăng ký dễ dàng, hỗ trợ thủ tục nhanh chóng trong vòng 24 giờ làm việc.",
      },
      {
        question: "Trở thành Tài xế EatNow Driver",
        cards: [
          {
            title: "Thu nhập 12 - 20 triệu",
            description: "Mức thu nhập hấp dẫn, chiết khấu cạnh tranh cùng chính sách thưởng đơn lớn.",
            icon: PaymentsOutlinedIcon,
          },
          {
            title: "Thời gian linh hoạt",
            description: "Hoàn toàn chủ động thời gian làm việc, bật app nhận đơn bất cứ lúc nào.",
            icon: AccessTimeOutlinedIcon,
          },
          {
            title: "Bảo hiểm & Quyền lợi",
            description: "Hỗ trợ trang bị bảo hộ, bảo hiểm tai nạn và các chương trình gắn kết tài xế.",
            icon: SecurityOutlinedIcon,
          },
        ],
        description:
          "Gia nhập đại gia đình EatNow Driver ngay hôm nay để nhận thu nhập xứng đáng cùng môi trường làm việc thân thiện, chuyên nghiệp.",
      },
      {
        question: "Quyền lợi và Hỗ trợ đối tác mới",
        cards: [
          {
            title: "Ưu đãi phí duy trì",
            description: "Miễn phí duy trì gian hàng tháng đầu tiên cho đối tác quán ăn mới.",
            icon: CardGiftcardOutlinedIcon,
          },
          {
            title: "Chụp ảnh món ăn",
            description: "Đội ngũ chuyên nghiệp hỗ trợ chụp ảnh món ăn và thiết kế thực đơn chuẩn SEO.",
            icon: LocalOfferOutlinedIcon,
          },
          {
            title: "Chuyên viên đồng hành",
            description: "Chuyên viên tư vấn 1-1 hỗ trợ kích hoạt gian hàng và chạy chiến dịch khuyến mãi.",
            icon: SupportAgentOutlinedIcon,
          },
        ],
        description:
          "EatNow luôn có những gói hỗ trợ thiết thực để giúp các đối tác nhanh chóng hòa nhập và bứt phá doanh số ngay từ những tuần đầu tiên.",
      },
    ],
  },
  {
    id: "support",
    label: "Hỗ trợ & Trợ giúp",
    items: [
      {
        question: "Chính sách giải quyết khiếu nại & Hoàn tiền",
        cards: [
          {
            title: "Tiếp nhận tức thì",
            description: "Hệ thống tiếp nhận phản ánh 24/7 và phản hồi khách hàng trong 15 phút.",
            icon: HeadsetMicOutlinedIcon,
          },
          {
            title: "Hoàn tiền nhanh chóng",
            description: "Hoàn tiền 100% trong 24h nếu đơn hàng giao sai món, thiếu món hoặc hư hại.",
            icon: PaymentsOutlinedIcon,
          },
          {
            title: "Bảo vệ quyền lợi",
            description: "Mọi đơn hàng đều được đảm bảo quyền lợi theo quy chuẩn an toàn dịch vụ.",
            icon: SecurityOutlinedIcon,
          },
        ],
        description:
          "Sự hài lòng và tin cậy của bạn là ưu tiên hàng đầu của EatNow. Chúng tôi cam kết xử lý mọi khiếu nại công tâm và nhanh chóng nhất.",
      },
      {
        question: "Các kênh liên hệ tổng đài và Chăm sóc khách hàng",
        cards: [
          {
            title: "Hotline 1900 xxxx",
            description: "Đường dây nóng hoạt động 24/7 giải quyết các sự cố đơn hàng khẩn cấp.",
            icon: SupportAgentOutlinedIcon,
          },
          {
            title: "Live Chat FoodBot",
            description: "Khung chat trực tuyến trong ứng dụng hỗ trợ khách hàng không gián đoạn.",
            icon: LocalMallOutlinedIcon,
          },
          {
            title: "Email hỗ trợ",
            description: "Gửi phản ánh chi tiết và góp ý dịch vụ tới support@eatnow.vn.",
            icon: CheckCircleOutlineOutlinedIcon,
          },
        ],
        description:
          "Bạn luôn có thể kết nối với đội ngũ EatNow qua đa kênh bất cứ lúc nào cần hỗ trợ trong suốt quá trình đặt món và giao nhận.",
      },
      {
        question: "Bảo mật tài khoản & Thông tin cá nhân",
        cards: [
          {
            title: "Xác thực OTP",
            description: "Bảo mật tài khoản 2 lớp qua mã OTP gửi trực tiếp về email hoặc số điện thoại.",
            icon: SecurityOutlinedIcon,
          },
          {
            title: "Quản lý địa chỉ",
            description: "Dễ dàng thêm mới, chỉnh sửa và lưu nhiều địa chỉ nhận hàng quen thuộc.",
            icon: LocationOnOutlinedIcon,
          },
          {
            title: "Mã hóa dữ liệu",
            description: "Toàn bộ thông tin thanh toán và lịch sử giao dịch được mã hóa chuẩn quốc tế.",
            icon: CheckCircleOutlineOutlinedIcon,
          },
        ],
        description:
          "EatNow cam kết bảo mật tuyệt đối dữ liệu người dùng, không chia sẻ thông tin cho bên thứ ba ngoài mục đích thực hiện đơn hàng.",
      },
    ],
  },
];
