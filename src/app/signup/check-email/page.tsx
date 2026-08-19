import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { Box, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

import AuthLayout from "@/components/auth/AuthLayout";

export default function CheckEmailPage() {
  return (
    <AuthLayout variant="register">
      <Stack spacing={3} className="auth-result-panel">
        <Box className="auth-status-icon auth-status-icon--success">
          <MarkEmailReadOutlinedIcon />
        </Box>
        <Box className="auth-header auth-header--centered">
          <Typography component="h1" className="auth-title">
            Kiểm tra email của bạn
          </Typography>
          <Typography className="auth-description">
            EatNow đã gửi hướng dẫn xác nhận tài khoản. Nếu chưa thấy email,
            hãy kiểm tra thư mục spam hoặc thử đăng ký lại sau ít phút.
          </Typography>
        </Box>
        <NextLink className="auth-button-link" href="/login">
          Quay lại đăng nhập
        </NextLink>
      </Stack>
    </AuthLayout>
  );
}
