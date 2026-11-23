# XenForo Thread Gallery

English: [README.md](README.md) · Tác giả: Dylan Phan · Giấy phép: [MIT](LICENSE)

Script gom toàn bộ ảnh và video của một chủ đề XenForo (qua mọi trang) thành một album xem liền mạch. Giao diện tự chọn tiếng Việt hoặc tiếng Anh theo ngôn ngữ trình duyệt.

## Đăng lên Greasy Fork

1. Đăng nhập [greasyfork.org](https://greasyfork.org) → tên tài khoản → **Post a script**.
2. Ô *Code*: dán toàn bộ `xenforo-thread-gallery.user.js`. Tên, mô tả (Anh + Việt), giấy phép MIT và icon đã có sẵn trong phần đầu script.
3. Ô *Additional info*: dán nội dung `GREASYFORK.md` (tiếng Anh), chọn định dạng Markdown. Sau đó thêm phần mô tả theo ngôn ngữ cho **Tiếng Việt (vi)** và dán `GREASYFORK.vi.md` vào đó, để người xem dùng tiếng Việt thấy mô tả tiếng Việt.
4. Bấm **Post script**.

### Đồng bộ từ GitHub

Mã nguồn: <https://github.com/phanhuyduong2003/xf-gallery>. Greasy Fork lấy được cả code lẫn phần mô tả từ kho này, nên khi cập nhật không phải dán tay.

Trên Greasy Fork → trang script → **Quản trị** (*Admin*):

1. **Đồng bộ mã nguồn**: điền liên kết `https://raw.githubusercontent.com/phanhuyduong2003/xf-gallery/main/xenforo-thread-gallery.user.js`, chọn **Tự động**.
2. **Thông tin bổ sung mặc định**: chọn Markdown, đồng bộ từ `https://raw.githubusercontent.com/phanhuyduong2003/xf-gallery/main/GREASYFORK.md`.
3. **Thêm thông tin bổ sung được bản địa hoá** → **Tiếng Việt (vi)**, đồng bộ từ `https://raw.githubusercontent.com/phanhuyduong2003/xf-gallery/main/GREASYFORK.vi.md`.
4. **Ngôn ngữ mặc định**: English.
5. Mở [Thiết lập webhook](https://greasyfork.org/vi/users/webhook-info), sao chép *Payload URL* và *Secret*. Trên GitHub → kho → **Settings → Webhooks → Add webhook**: dán cả hai, *Content type* chọn `application/json`, sự kiện chọn **Just the push event**. Từ đó Greasy Fork cập nhật ngay khi bạn đẩy code, không phải chờ lần kiểm tra định kỳ.

**Phát hành bản cập nhật:** mỗi thay đổi ghi vào [CHANGELOG.vi.md](CHANGELOG.vi.md) (và [CHANGELOG.md](CHANGELOG.md)) ở mục *Chưa phát hành*. Khi phát hành, chuyển các mục đó sang một mục phiên bản mới, đổi `@version` thành đúng số đó (vd `2.0.1`), rồi commit với tóm tắt một dòng như trong [CONTRIBUTING.vi.md](CONTRIBUTING.vi.md). Đẩy lên nhánh `main`: Greasy Fork tự lấy code mới và dùng commit message làm changelog.

Nếu đã cài bản cũ "XenForo Album", hãy gỡ nó đi trước khi cài bản mới để không có 2 nút Album. Các tuỳ chọn cũ (chế độ xem, danh sách dịch vụ ảnh) không được chuyển sang.

## Cài đặt

1. Cài tiện ích quản lý userscript:
   - Chrome / Edge / Brave (Chromium): **Tampermonkey** hoặc **Violentmonkey**.
     Với Tampermonkey trên Chrome mới, cần bật thêm *Allow User Scripts* (hoặc *Developer mode*) trong trang quản lý tiện ích.
   - Firefox: **Violentmonkey** hoặc **Tampermonkey**.
2. Cài từ trang Greasy Fork của script (nút **Install**), hoặc mở bảng điều khiển của tiện ích → *Tạo script mới* → dán toàn bộ `xenforo-thread-gallery.user.js` → Lưu.
3. Mở một chủ đề trên diễn đàn. Góc phải dưới sẽ có nút **Album**.

Nếu không thấy nút (diễn đàn dùng địa chỉ không có chữ `threads`), thêm một dòng `// @match` cho tên miền diễn đàn vào phần đầu script, ví dụ:

```
// @match        https://ten-dien-dan.com/*
```

### Cho phép truy cập mọi tên miền

Để tải ảnh từ các dịch vụ lưu ảnh, đọc trang xem ảnh và tìm ảnh thu nhỏ cho video, script cần gửi yêu cầu sang tên miền khác. Lần đầu như vậy, Tampermonkey hiện hộp thoại **"Một tập lệnh người dùng muốn truy cập một tài nguyên xuyên nguồn gốc"**. Để nó không hỏi lại với mỗi dịch vụ mới:

- **Cách 1, ngay trong hộp thoại:** bấm **Luôn cho phép tất cả các tên miền** (*Always allow all domains*). Nút này có sẵn vì script khai báo `@connect *`. Từ đó Tampermonkey không hỏi lại với bất kỳ tên miền nào.
- **Cách 2, trong phần cài đặt** (khi lỡ chọn nút khác, hoặc muốn cài sẵn từ trước):
  1. Mở bảng điều khiển Tampermonkey → bấm vào tên script → thẻ **Cài đặt** (*Settings*).
  2. Ở mục **Bảo mật XHR** (*XHR Security*), tìm ô **Danh sách tên miền được phép của người dùng** (*User domain whitelist*).
  3. Thêm một dòng chỉ có dấu `*`, rồi bấm **Lưu** (*Save*).

Nếu bạn chỉ bấm **Cho phép một lần** hoặc **Luôn cho phép tên miền này**, hộp thoại sẽ hiện lại với các dịch vụ khác. Lần sau chọn **Luôn cho phép tất cả các tên miền**, hoặc làm theo cách 2.

Violentmonkey không hiện hộp thoại này: script khai báo `@connect *` được phép kết nối mọi tên miền.

## Sử dụng

Bấm nút **Album** để mở album dạng modal ngay trên trang (trang diễn đàn vẫn mờ phía sau). Script đọc mọi trang của chủ đề (từng trang một, nghỉ khoảng 1–2 giây giữa các trang để không làm quá tải diễn đàn) và thêm ảnh/video dần theo đúng thứ tự bài viết. Bấm ảnh/video trong bài viết vẫn hoạt động như bình thường của diễn đàn.

Trong modal có 3 kiểu xem:

- **Xem** (mặc định): ảnh lớn ở giữa, dải ảnh thu nhỏ ở dưới để nhảy nhanh tới ảnh khác.
  - Chuyển ảnh: phím ← →, nút ‹ ›, hoặc vuốt ngang trên điện thoại.
  - Phóng to: bấm chuột trái vào ảnh (bấm lần nữa để thu lại), lăn chuột, hoặc chụm hai ngón. Khi đang phóng to thì kéo để di chuyển. Chuột phải vẫn mở menu bình thường (lưu ảnh, sao chép…), không phóng to.
  - **Tự động phát** (phím Space): tự chuyển ảnh sau 3,5 giây; với video thì chờ phát xong.
  - **Video** dùng thanh điều khiển kiểu Reels nằm sát mép dưới video, ngay dưới thông tin người đăng: nút phát/tạm dừng, thời gian, tắt tiếng, toàn màn hình và thanh tiến trình mảnh (bấm hoặc kéo để tua).
    - Bấm vào video để phát/tạm dừng, bấm đúp để xem toàn màn hình. Phím tắt: **K** phát/tạm dừng, **M** tắt tiếng, **F** toàn màn hình.
    - Mặc định video chỉ hiện thanh thời gian thu gọn ở mép dưới, không che nội dung.
    - **Máy tính:** di chuột vào video thì hiện thông tin người đăng và các nút; chuột ra ngoài video là ẩn ngay.
    - **Điện thoại:** chạm vào video để tạm dừng thì hiện thông tin, các nút và cho tua; chạm lần nữa để phát tiếp thì thu gọn lại. Khi đang phát, thanh thời gian chỉ để xem, không tua được (tránh tua nhầm khi chạm).
    - Lựa chọn tắt tiếng được ghi nhớ cho lần sau.
  - **Video nhúng** (YouTube, Streamable dạng nhúng…) có thanh điều khiển riêng mà script không chỉnh được, nên thông tin người đăng được đặt thành thẻ bên dưới khung video thay vì đè lên.
- **Lưới** (phím G): toàn bộ ảnh thu nhỏ; bấm một ảnh để mở ở chế độ Xem.
- **Cuộn**: ảnh to xếp lần lượt theo chiều dọc, video phát ngay trong trang.

Kiểu xem được ghi nhớ cho lần sau. Các nút khác:

- **Bài gốc ↗ / Nguồn ↗**: mở bài viết chứa mục đang xem, hoặc link gốc của ảnh/video.
- **Dừng tải**: dừng giữa chừng với chủ đề quá dài. Nút chỉ hiện khi đang tải.
- **Nhãn người đăng (kiểu Reels)**:
  - Góc trên trái video luôn hiện nhãn **Tác giả chủ đề** (chủ thớt, màu xanh) hoặc **Thành viên**.
  - Phần thông tin ở mép dưới gồm ảnh đại diện, tên người đăng, ngày đăng và nội dung bài viết kèm theo (gọn 2 dòng, bấm *Xem thêm* để đọc hết). Phần này hiện cùng các nút điều khiển, trên một lớp phủ mờ nhạt để không che video.
  - Nội dung bài đã bỏ phần trích dẫn, link trần và chữ của link ảnh/video.
  - Phím **I** bật/tắt nhãn. Khi đang phóng to ảnh, cả nhãn góc lẫn phần thông tin đều tự ẩn, thu về như cũ thì hiện lại.
  - Ở chế độ Cuộn, nhãn hiện thành thẻ phía trên video; ở chế độ Lưới, tên người đăng hiện ở góc ô video.
  - Tác giả chủ đề được lấy từ dòng thông tin đầu chủ đề, hoặc từ người viết bài đầu tiên của trang 1.
- **Tuỳ chọn** (biểu tượng hai thanh trượt):
  - *Hiện nhãn người đăng trên video* / *cả trên ảnh*: mặc định chỉ hiện trên video và video nhúng.
  - *Hiện mục hỏng*: mặc định ảnh/video đã bị xoá được ẩn đi; bật để thấy chúng trong chế độ Lưới / Cuộn và mở link nguồn.
  - *Sửa danh sách dịch vụ ảnh*: tên miền mà link trỏ tới *trang xem ảnh* (chứ không phải file ảnh). Script mở trang đó ngầm để lấy file thật. Mục không có dấu chấm (vd `zpic`) khớp mọi tên miền chứa chuỗi đó. Gặp dịch vụ mới thì thêm vào đây.
  - *Tải lại chủ đề này (bỏ qua bộ nhớ đệm)*: tải lại mọi trang và mọi link, dùng khi bài ở các trang cũ đã bị sửa hoặc xoá.
- Đóng modal: nút ✕, phím Esc, hoặc bấm ra vùng tối bên ngoài. Mở lại sẽ quay về đúng chỗ đang xem, không phải tải lại.

### Bộ nhớ đệm và chuyển trang

Chuyển từ trang 1 sang trang 2 của chủ đề là tải lại cả trang web, nên script khởi động lại từ đầu. Để không phải tải lại cả chủ đề mỗi lần như vậy, script lưu bộ nhớ đệm trong trình duyệt (IndexedDB, chỉ nằm trên máy bạn):

| Dữ liệu | Giữ trong |
|---|---|
| Ảnh/video và thông tin người đăng của từng trang | 12 giờ |
| Kết quả lấy file thật từ link dịch vụ ảnh | 7 ngày (link hỏng: 1 ngày) |
| Ảnh thu nhỏ video do script tìm được | 7 ngày |
| Mục bạn đang xem | 12 giờ |

Khi mở album:

- Trang đang đọc được đọc thẳng từ trang web: không tốn yêu cầu nào, luôn mới nhất.
- Các trang khác lấy từ bộ nhớ đệm nếu còn mới; dòng trạng thái cho biết bao nhiêu trang ("3 trang từ bộ nhớ đệm").
- Trang cuối luôn được tải lại vì bài mới nằm ở đó. Trang mới phát sinh cũng được tải.
- Chỉ những link chưa có trong bộ nhớ đệm mới phải hỏi dịch vụ ảnh.
- Album mở ở **ảnh/video đầu tiên của trang đang đọc**. Nếu trước đó bạn đang xem dở một mục thuộc trang này, album mở đúng mục đó.

Bộ nhớ đệm giữ 30 chủ đề xem gần nhất và tự xoá mục hết hạn mỗi ngày một lần. Muốn làm mới toàn bộ, dùng *Tải lại chủ đề này* trong **Tuỳ chọn**.

## Những gì script nhận ra

| Loại | Cách xử lý |
|---|---|
| Ảnh/video tải lên diễn đàn (`/attachments/`) | Lấy bản đầy đủ thay vì ảnh thu nhỏ |
| Ảnh đã nhúng `[IMG]`, ảnh tải chậm, ảnh qua proxy của diễn đàn | Lấy link gốc, dự phòng bằng bản proxy (bản này đôi khi còn khi ảnh gốc đã bị xoá) |
| Link thẳng tới `.jpg .png .gif .webp .mp4 .webm …` | Hiện trực tiếp |
| anh.moe, ibb.co, zpic… (Chevereto) | Mở trang lấy ảnh gốc, bỏ đuôi `.md` / `.th` để ra ảnh kích thước đầy đủ; link album thì lấy cả album |
| Streamable | Lấy file mp4 qua API (phát hiện được video đã xoá), không lấy được thì dùng trình phát nhúng |
| Imgur, YouTube, Vimeo, RedGifs, TikTok | Ảnh trực tiếp hoặc trình phát nhúng |
| Dịch vụ khác trong danh sách | Đọc thẻ `og:image` / `og:video` của trang |

### Ảnh thu nhỏ cho video

Video nào chưa có sẵn ảnh thu nhỏ thì script tự tìm theo thứ tự, và cập nhật ô video ngay khi tìm được:

1. Video là file trực tiếp (`.mp4`, `.webm`…): chụp một khung hình ở khoảng giây thứ 1,5. Chỉ chụp được khi video nằm trên chính diễn đàn hoặc máy chủ video cho phép.
2. Vimeo, Streamable, TikTok: hỏi ảnh đại diện qua oEmbed. RedGifs: hỏi qua API của RedGifs.
3. Dịch vụ khác: đọc thẻ `og:image` của trang gốc.
4. Không lấy được bằng cách nào ở trên: ô video hiện khung hình ở giây thứ 1 thay vì khung đầu (thường đen).

Nếu ảnh thu nhỏ có sẵn bị hỏng, script cũng thử lại các bước trên.

Ảnh trùng (do trích dẫn lại) chỉ hiện một lần. Ảnh bị chặn hotlink được tải lại qua tiện ích. Ảnh lỗi hoặc ảnh giữ chỗ "removed" được đánh dấu hỏng.

Ảnh tải lỗi được thử lại một lần sau 2 giây trước khi bị coi là hỏng, để tránh nhầm do mạng chập chờn.

Icon trong giao diện lấy từ [Lucide](https://lucide.dev) (giấy phép ISC), nhúng thẳng vào script dưới dạng SVG nên không tải gì thêm từ bên ngoài.

## Giới hạn

- Ảnh đã bị xoá ở nơi lưu thì không lấy lại được, chỉ ẩn đi.
- Với trình phát nhúng dạng iframe (YouTube…), script không biết video còn hay đã bị xoá.
- Dịch vụ bắt giải captcha / Cloudflare thì sẽ báo "không tải được"; bấm **nguồn ↗** để mở tay.
