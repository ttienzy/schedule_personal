# Personal Discipline - Lịch trình tuần

Ứng dụng quản lý lịch trình tuần cá nhân với drag & drop, dark mode, và PWA support.

## Tính năng

- **Week Grid View** - Lịch tuần 7 ngày với time slots động
  - Tự động tạo time slots dựa trên các slots thực tế
  - Khoảng cách 30 phút giữa các time slots
  - Hỗ trợ mọi khung giờ (00:00 - 23:59)
- **Push Notifications** 🔔 - Nhận thông báo nhắc nhở trước khi hoạt động bắt đầu
  - Thông báo tự động 1-2 phút trước giờ bắt đầu
  - Hoạt động ngay cả khi đóng app
  - Quản lý subscription dễ dàng
- **Drag & Drop** - Kéo thả slots để di chuyển hoặc hoán đổi
- **Bulk Add Slots** - Thêm nhiều slots cùng lúc cho nhiều ngày với validation tự động
- **Pagination & Search** - Tìm kiếm và phân trang lịch trình (5 schedules/trang, fetch tối đa 10)
- **Dark Mode** - Chuyển đổi light/dark mode
- **Responsive** - Desktop grid view, mobile list view
- **Authentication** - Đăng nhập với Google OAuth
- **Real-time Sync** - Supabase backend với optimistic updates
- **Share & Export** - Chia sẻ public link, export/import JSON
- **Categories** - Phân loại hoạt động với màu sắc
- **Rules** - Quy tắc không thương lượng
- **PWA** - Cài đặt như app native, hoạt động offline

## Setup

### 1. Prerequisites

- Node.js 18+ và npm
- Tài khoản Supabase (miễn phí)

### 2. Clone & Install

```bash
cd schedule-app
npm install
```

### 3. Supabase Setup

#### 3.1. Tạo project trên Supabase

1. Truy cập [supabase.com](https://supabase.com)
2. Tạo project mới
3. Lấy `Project URL` và `anon public key` từ Settings → API

#### 3.2. Tạo database schema

Chạy SQL sau trong Supabase SQL Editor:

```sql
-- Categories table
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color_bg TEXT NOT NULL,
  color_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  week_label TEXT,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Slots table
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id),
  day INT2 NOT NULL CHECK (day BETWEEN 1 AND 7),
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rules table
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  "order" INT2 NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (id, label, color_bg, color_text) VALUES
  ('sleep', 'Ngủ/Nghỉ', '#D3D1C7', '#444441'),
  ('meal', 'Ăn uống', '#FAC775', '#3d3d3a'),
  ('school', 'Học tập', '#C0DD97', '#3d3d3a'),
  ('work', 'Làm việc', '#A8D5E5', '#3d3d3a'),
  ('exercise', 'Vận động', '#FFB6C1', '#3d3d3a'),
  ('hobby', 'Sở thích', '#E6D5F5', '#3d3d3a'),
  ('social', 'Giao lưu', '#FFE4B5', '#3d3d3a'),
  ('checkin', 'Check-in', '#FFB3BA', '#3d3d3a'),
  ('deepwork', 'Deep Work', '#B5E7A0', '#3d3d3a'),
  ('reading', 'Đọc sách', '#C7CEEA', '#3d3d3a');
```

#### 3.3. Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

-- Schedules policies
CREATE POLICY "Users can view own schedules"
  ON schedules FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can view shared schedules"
  ON schedules FOR SELECT
  USING (is_shared = true);

CREATE POLICY "Users can insert own schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own schedules"
  ON schedules FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own schedules"
  ON schedules FOR DELETE
  USING (auth.uid() = owner_id);

-- Slots policies
CREATE POLICY "Users can view slots of own schedules"
  ON slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = slots.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view slots of shared schedules"
  ON slots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = slots.schedule_id
      AND schedules.is_shared = true
    )
  );

CREATE POLICY "Users can manage slots of own schedules"
  ON slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = slots.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

-- Rules policies (similar to slots)
CREATE POLICY "Users can view rules of own schedules"
  ON rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = rules.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view rules of shared schedules"
  ON rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = rules.schedule_id
      AND schedules.is_shared = true
    )
  );

CREATE POLICY "Users can manage rules of own schedules"
  ON rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM schedules
      WHERE schedules.id = rules.schedule_id
      AND schedules.owner_id = auth.uid()
    )
  );

-- Categories are public read
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);
```

#### 3.4. Google OAuth Setup

1. Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Thêm Authorized redirect URIs: `https://<your-project>.supabase.co/auth/v1/callback`

### 4. Environment Variables

Tạo file `.env` trong thư mục `schedule-app/`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
```

**Lưu ý**: Để bật Push Notifications, xem hướng dẫn chi tiết trong file `PUSH_NOTIFICATION_DEPLOYMENT.md`

### 5. Run Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
npm run preview
```

## PWA Installation

Sau khi deploy, người dùng có thể:

- Desktop: Click icon "Install" trên address bar
- Mobile: "Add to Home Screen" từ browser menu

## Features Guide

### Push Notifications 🔔

- Nhận thông báo tự động trước 1-2 phút khi hoạt động sắp bắt đầu
- Hoạt động ngay cả khi đóng app (nhờ Service Worker)
- Quản lý trong phần "Thông báo nhắc nhở" ở sidebar
- Yêu cầu:
  - Browser hỗ trợ Push API (Chrome, Firefox, Edge, Safari 16+)
  - Cấp quyền thông báo cho website
  - HTTPS (hoặc localhost để test)

**Setup**: Xem file `PUSH_NOTIFICATION_DEPLOYMENT.md` để cấu hình server-side

### Dynamic Week Grid

- Grid tự động điều chỉnh dựa trên các slots thực tế
- Không giới hạn khung giờ cố định
- Có thể tạo slots ở bất kỳ thời gian nào (VD: 04:30, 23:45)
- Tự động tạo time slots với khoảng cách 30 phút
- Nếu chưa có slots, hiển thị khung giờ mặc định (06:30 - 22:30)

### Schedule Validation

- Hệ thống tự động kiểm tra trùng lặp tuần trước khi tạo schedule mới
- Không cho phép tạo 2 schedules có khoảng thời gian trùng lặp
- Hiển thị thông báo lỗi chi tiết với tên schedule bị conflict
- Áp dụng cho cả tạo manual và auto-create (nút next week)

### Pagination & Search

- Mỗi trang hiển thị 5 lịch trình
- Tìm kiếm theo tiêu đề hoặc nhãn tuần
- Phân trang với số trang (1, 2, 3, ...)
- Fetch tối đa 10 schedules mỗi lần request

### Bulk Add Slots (Thêm nhiều slots)

- Click nút "⚡ Thêm nhiều slots" trên week grid
- Chọn nhiều ngày cùng lúc (có nút "Chọn tất cả")
- Nhập thời gian và chọn category từ dropdown
- Nhập label một lần
- Hệ thống tự động kiểm tra xung đột:
  - Phát hiện slots trùng giờ trên từng ngày
  - Hiển thị danh sách chi tiết các xung đột
  - Không cho phép tạo nếu có xung đột
- Preview số lượng slots sẽ được tạo
- Tạo tất cả slots cùng lúc với một click

### Slot Management

- Click vào slot để xem/sửa chi tiết
- Category picker dạng dropdown đơn giản (thay vì grid)
- Dropdown hiển thị màu của category đã chọn
- Validation tự động:
  - Giờ bắt đầu phải nhỏ hơn giờ kết thúc
  - Hiển thị error message real-time
  - Disable nút submit khi có lỗi
- Drag & drop để di chuyển hoặc hoán đổi slots

### Drag & Drop

- Kéo icon "⋮⋮" bên trái slot để di chuyển
- Kéo đè lên slot khác → Hoán đổi vị trí
- Kéo vào ô trống → Di chuyển bình thường

### Dark Mode

- Click icon moon/sun ở header để chuyển đổi
- Theme được lưu tự động

### Mobile View

- Desktop: Grid view 7 cột
- Mobile: List view theo ngày

### Share Schedule

- Toggle "Chia sẻ công khai" → Copy link
- Link có dạng: `/view/:scheduleId`
- Người khác xem được nhưng không sửa

### Export/Import

- Export: Download JSON file
- Import: Upload JSON để restore

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Styling**: Inline styles với CSS variables
- **Drag & Drop**: @dnd-kit/core
- **Routing**: react-router-dom
- **PWA**: Service Worker + Manifest

## Project Structure

```
schedule-app/
├── public/              # Static assets, PWA files
├── src/
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks (useAuth, useSlots, etc.)
│   ├── lib/            # Supabase client, types
│   ├── pages/          # Dashboard, ScheduleView, PublicView
│   ├── utils/          # Helper functions
│   ├── App.tsx         # Router setup
│   └── main.tsx        # Entry point
├── .env                # Environment variables (gitignored)
├── .gitignore
└── package.json
```

## Troubleshooting

### Không đăng nhập được

- Kiểm tra Google OAuth đã enable trong Supabase
- Kiểm tra redirect URI đúng chưa

### Không thấy data

- Kiểm tra RLS policies đã tạo chưa
- Kiểm tra `owner_id` trong schedules table

### PWA không hoạt động

- Chỉ hoạt động trên HTTPS hoặc localhost
- Clear cache và reload

## License

MIT
