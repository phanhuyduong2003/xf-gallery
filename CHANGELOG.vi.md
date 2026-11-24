# Lịch sử thay đổi

English: [CHANGELOG.md](CHANGELOG.md)

Mọi thay đổi đáng chú ý của **XenForo Thread Gallery** được ghi ở đây, mới nhất ở trên cùng.

**Khi phát hành bản cập nhật:**
1. Chuyển các mục trong *Chưa phát hành* sang một mục phiên bản mới, ghi ngày hôm nay.
2. Đổi `@version` trong `xenforo-thread-gallery.user.js` thành đúng số đó.
3. Commit với tóm tắt một dòng các mục của phiên bản đó (xem [CONTRIBUTING.vi.md](CONTRIBUTING.vi.md)) rồi đẩy lên `main`. Greasy Fork tự đồng bộ code và hiện commit message làm changelog.

Quy tắc commit và các bước phát hành đầy đủ: [CONTRIBUTING.vi.md](CONTRIBUTING.vi.md).

Cách đánh số: `2.0.1` cho sửa lỗi, `2.1.0` cho tính năng mới, `3.0.0` cho thay đổi lớn làm hỏng cách dùng hoặc tuỳ chọn cũ.

## [Chưa phát hành]

### Thêm
- Chế độ tải trong *Tuỳ chọn → Tải trang*: **Tiết kiệm** (chỉ trang đang đọc, trang kế tiếp khi xem tới), **Cân bằng** (mặc định: 2 trang mỗi bên, đi theo khi bạn xem) và **Toàn bộ chủ đề** (hỏi trước nếu trên 50 trang).
- Trang chưa tải hiện thành ô "Tr. 4–8 · chưa tải" trong dải ảnh và trong lưới; bấm vào để tải trang gần nhất và nhảy tới đó. Tiếp / trước, đầu / cuối và tự động phát tự tải trang cần thiết rồi mới chuyển. Lưới và Cuộn tải trang tiếp khi cuộn tới cuối.
- Thanh thông báo cho biết vì sao việc tải tạm dừng (captcha, "giảm tốc", giới hạn 40 trang) kèm nút **Tiếp tục** / **Mở chủ đề**.

### Thay đổi
- **Album không còn tải cả chủ đề theo mặc định.** Yêu cầu tải trang được giãn như người thật đang đọc để tránh captcha và khoá tài khoản: mỗi diễn đàn một yêu cầu tại một thời điểm, dùng chung mọi tab, cách nhau khoảng 5 giây (lâu hơn khi diễn đàn chậm), tối đa 40 trang mỗi 10 phút, không tải khi tab ẩn hoặc album đóng. Captcha / kiểm tra bảo mật hoặc lỗi 403 / 503 dừng tải ở mọi tab và không tự thử lại; lỗi 429 thì đợi đúng thời gian diễn đàn yêu cầu, lâu dần mỗi lần, và dừng ở lần thứ ba.
- Trang chủ đề trong bộ nhớ đệm được giữ 7 ngày (3 trang cuối: 1 giờ) thay vì 12 giờ, nên chuyển trang tốn ít yêu cầu hơn.

### Sửa lỗi
-

## [2.5.0] - 2026-11-24

### Thêm
- Icon nhỏ "mở trong tab mới" sau tiêu đề mỗi chủ đề trong danh sách chủ đề XenForo (chuyên mục, bài mới, kết quả tìm kiếm), kể cả các mục nạp thêm sau.

### Thay đổi
- Chạy được với mọi kiểu địa chỉ diễn đàn (`/t/`, `/chu-de/`, địa chỉ tuỳ chỉnh): trang chủ đề được nhận ra qua mã trang XenForo thay vì chữ `threads/` trong địa chỉ, mã chủ đề lấy từ link chuẩn của trang. Script được phép chạy trên mọi trang nhưng dừng ngay trên trang không phải XenForo; các trang lớn không phải diễn đàn được loại trừ sẵn.

## [2.4.0] - 2026-11-24

### Thêm
- Thông báo máy chủ chậm: sau 5 giây tải, hiện thông báo kèm nút **Thử lại** và **Mở link gốc** (thông tin người đăng vẫn ẩn cho tới khi tải xong).

### Thay đổi
- Tự động phát chỉ bắt đầu đếm giờ khi ảnh đã tải xong, và bỏ qua mục nào sau 15 giây vẫn chưa tải xong (không đánh dấu hỏng).
- Khi ảnh hoặc video còn đang tải, chỉ hiện vòng xoay: thông tin người đăng và nhãn Tác giả chủ đề / Thành viên hiện khi tải xong.

### Sửa lỗi
- Một trang chủ đề không phản hồi làm treo cả quá trình tải: yêu cầu giờ được huỷ sau 20 giây và thử lại tối đa 3 lần, sau đó trang được tính là lỗi và các trang sau vẫn tải tiếp.
- Ảnh thu nhỏ tải chậm không còn chặn hàng đợi: mỗi ảnh nhường chỗ sau 10 giây và vẫn tiếp tục tải ngầm. Việc tải trước ảnh kế bên cũng vậy.

## [2.3.0] - 2026-11-24

### Thêm
- Nâng dần cỡ ảnh cho Imgur và Chevereto: dải ảnh dùng bản nhỏ, chế độ Lưới dùng bản vừa, và hiện tạm bản vừa khi ảnh gốc sau 0,8 giây vẫn đang tải.
- Video nhẹ hơn khi mạng chậm hoặc bật tiết kiệm dữ liệu: bản điện thoại của Streamable và bản SD của RedGifs. RedGifs giờ phát thẳng trong trình phát kiểu Reels, không được thì dùng trình phát nhúng.

### Thay đổi
- Mục mở đầu được chọn khi trang đang đọc xử lý xong (tối đa khoảng 1,5 giây), nên không còn nhảy khi một link ở đầu trang xử lý xong muộn.

### Sửa lỗi
- Ảnh thu nhỏ ở dải ảnh không hiện khi tự động phát: ảnh thu nhỏ đã trôi khỏi tầm nhìn không còn chiếm chỗ trong hàng đợi, và ảnh lớn đã tải cũng được dùng cho ô thu nhỏ của nó.

## [2.2.0] - 2026-11-24

### Thêm
- Thông tin người đăng trên ảnh, giống video: trên máy tính hiện khi di chuột vào ảnh; trên điện thoại luôn hiện một dòng thu gọn (tên + một dòng nội dung), chạm để mở rộng.
- Tiêu đề riêng cho từng mục trong bài có nhiều ảnh/video: mỗi mục hiện đoạn chữ nằm sát nó (tự nhận biết tiêu đề nằm trên hay dưới ảnh theo từng bài), vị trí trong bài ("2/5 trong bài") và nút *Xem cả bài*.
- Tuỳ chọn riêng để hiện thông tin trên ảnh và trên video (mặc định đều bật). Phím **I** bật/tắt loại đang xem.
- Nút lọc cạnh số thứ tự: Tất cả / Ảnh / Video, kèm số lượng.
- Nhãn trang ("Trang 2/3") và vạch chia trang trong dải ảnh; dải ảnh luôn giữ mục đang xem ở giữa.
- Nút về mục đầu tiên / cuối cùng ở hai đầu dải ảnh, và phím **Home** / **End**.
- Kéo dải ảnh bằng chuột, hoặc cuộn bằng con lăn chuột.

### Thay đổi
- Tự động phát mặc định bật và ghi nhớ lựa chọn. Nút hiện ▶ khi tắt và biểu tượng tạm dừng khi bật.
- Nút chuyển ảnh trước / sau không bao giờ che ảnh/video: trên máy tính nằm ở khoảng trống hai bên, trên điện thoại nằm ở hai đầu dải ảnh thu nhỏ.
- Thanh công cụ gọn hơn: số thứ tự nằm trên một dòng nhỏ ghi trang, mục hỏng và tiến độ tải; bộ lọc gộp thành một nút thả xuống; cửa sổ hẹp hơn khoảng 960 px dùng 2 hàng như điện thoại.
- Tải ảnh nhanh hơn mà nhẹ nhàng hơn với máy chủ: ảnh thu nhỏ chỉ tải khi hiện trên màn hình và tối đa 4 ảnh cùng lúc, ảnh đang mở được ưu tiên và hiện ảnh thu nhỏ đã có kèm vòng xoay cho tới khi ảnh lớn tải xong, ảnh kế bên được tải trước lần lượt từng ảnh.

## [2.1.1] - 2026-11-24

### Thêm
- Link ủng hộ qua Ko-fi: hiện thành nút ủng hộ trên Greasy Fork (`@contributionURL`) và nút Sponsor trên GitHub.

### Thay đổi
- Nút chuyển ảnh trước / sau thành nút tròn to hơn, nền đậm, nổi rõ trên mọi ảnh và video.

### Sửa lỗi
- Nút chuyển ảnh trước / sau nằm đúng giữa chiều cao ảnh/video, thay vì giữa cả vùng gồm dải ảnh thu nhỏ.
- Trên điện thoại, dòng trạng thái dài không còn đẩy nút đóng xuống một hàng riêng.

## [2.1.0] - 2026-11-24

### Thêm
- Bộ nhớ đệm trong trình duyệt (IndexedDB) cho các trang của chủ đề (12 giờ), kết quả lấy file từ link dịch vụ ảnh (7 ngày) và ảnh thu nhỏ video (7 ngày). Chuyển trang trong chủ đề không còn tải lại cả chủ đề: trang đang đọc lấy từ trang web, các trang khác từ bộ nhớ đệm, chỉ trang cuối được tải lại.
- Album mở ở ảnh/video đầu tiên của trang đang đọc, hoặc ở mục đang xem dở trên trang đó.
- **Tuỳ chọn → Tải lại chủ đề này (bỏ qua bộ nhớ đệm)**.
- Nút chuyển ảnh/video trước / sau trên điện thoại. Trên mọi màn hình, nút tự mờ khi đang ở mục đầu hoặc cuối.

### Thay đổi
- Sắp xếp lại thanh công cụ: công cụ nào cũng hiện tên. Trên điện thoại chia 2 hàng: số thứ tự, trạng thái và nút đóng ở trên, hàng công cụ ở dưới với icon nằm trên tên.
- Icon riêng cho Bài gốc, Nguồn và Tự động phát, không còn dễ nhầm với nhau hay với nút phát video.
- Đổi tên "Trình chiếu" thành "Tự động phát".
- Tải từ tốn hơn để tránh làm quá tải diễn đàn và bị chặn: tải từng trang một, nghỉ 1,2–1,8 giây giữa các trang, giảm số yêu cầu cùng lúc tới dịch vụ ảnh, và chờ đúng thời gian máy chủ yêu cầu khi bị giới hạn tốc độ (Retry-After).

## [2.0.0] - 2026-11-24

Phát hành công khai lần đầu trên Greasy Fork.

### Thêm
- Gom toàn bộ ảnh và video qua mọi trang của một chủ đề XenForo 1.x / 2.x thành một album, theo đúng thứ tự bài viết.
- 3 kiểu xem: Xem (từng ảnh, kèm dải ảnh thu nhỏ), Lưới và Cuộn.
- Phóng to bằng bấm chuột, lăn chuột hoặc chụm 2 ngón; kéo để di chuyển; vuốt để chuyển ảnh trên điện thoại.
- Lấy file thật từ link: tệp đính kèm, ảnh tải chậm và ảnh qua proxy, link thẳng tới file, các dịch vụ Chevereto (kể cả album), Streamable, Imgur, YouTube, Vimeo, RedGifs, TikTok, và dịch vụ bất kỳ được thêm vào danh sách.
- Ẩn ảnh/video đã chết (link hỏng, lỗi 404, ảnh giữ chỗ "đã bị xoá"), vượt chặn hotlink, thử lại một lần khi mạng chập chờn, lọc ảnh trùng do trích dẫn.
- Trình phát video kiểu Reels: mặc định chỉ hiện thanh tiến trình mảnh; di chuột vào (máy tính) hoặc chạm để tạm dừng (điện thoại) để hiện thông tin người đăng và nút điều khiển.
- Nhãn người đăng: nhãn Tác giả chủ đề / Thành viên ở góc trên trái, kèm ảnh đại diện, tên, ngày đăng và nội dung bài.
- Tự tạo ảnh thu nhỏ cho video chưa có (chụp khung hình, oEmbed, API RedGifs, `og:image`).
- Tự động phát, phím tắt (← → Space G I K M F Esc).
- Giao diện tiếng Anh và tiếng Việt, tự chọn theo ngôn ngữ trình duyệt.

### Trước 2.0.0 (chưa công bố)
Phát triển riêng với tên "XenForo Album" (1.0 – 1.8). Tuỳ chọn của script đó không được chuyển sang.
