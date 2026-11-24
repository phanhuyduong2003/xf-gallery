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

**Phát hành bản cập nhật:** mỗi thay đổi ghi vào [CHANGELOG.vi.md](CHANGELOG.vi.md) (và [CHANGELOG.md](CHANGELOG.md)) ở mục *Chưa phát hành*. Khi phát hành, chuyển các mục đó sang một mục phiên bản mới, đổi `@version` trong `src/00-header.js` thành đúng số đó (vd `2.0.1`) rồi chạy `node build.mjs`, rồi commit với tóm tắt một dòng như trong [CONTRIBUTING.vi.md](CONTRIBUTING.vi.md). Đẩy lên nhánh `main`: Greasy Fork tự lấy code mới và dùng commit message làm changelog.

Nếu đã cài bản cũ "XenForo Album", hãy gỡ nó đi trước khi cài bản mới để không có 2 nút Album. Các tuỳ chọn cũ (chế độ xem, danh sách dịch vụ ảnh) không được chuyển sang.

## Cài đặt

1. Cài tiện ích quản lý userscript:
   - Chrome / Edge / Brave (Chromium): **Tampermonkey** hoặc **Violentmonkey**.
     Với Tampermonkey trên Chrome mới, cần bật thêm *Allow User Scripts* (hoặc *Developer mode*) trong trang quản lý tiện ích.
   - Firefox: **Violentmonkey** hoặc **Tampermonkey**.
2. Cài từ trang Greasy Fork của script (nút **Install**), hoặc mở bảng điều khiển của tiện ích → *Tạo script mới* → dán toàn bộ `xenforo-thread-gallery.user.js` → Lưu.
3. Mở một chủ đề trên diễn đàn. Góc phải dưới sẽ có nút **Album**.

Script chạy được với mọi kiểu địa chỉ của diễn đàn (`/threads/`, `/t/`, `/chu-de/`, `index.php?…`): script được phép chạy trên mọi trang, nhận ra trang chủ đề XenForo qua mã trang (`data-template="thread_view…"` ở XF 2, `thread_view` ở XF 1), và dừng ngay trên mọi trang khác, không chèn gì và không gửi yêu cầu nào. Các trang lớn không phải diễn đàn (Google, YouTube, Facebook…) được loại trừ sẵn.

Trên các danh sách chủ đề XenForo (chuyên mục, bài mới, kết quả tìm kiếm…), một icon ↗ nhỏ sau tiêu đề mỗi chủ đề để mở chủ đề đó trong tab mới.

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

Bấm nút **Album** để mở album dạng modal ngay trên trang (trang diễn đàn vẫn mờ phía sau). Album bắt đầu từ trang đang đọc, tải ngầm các trang xung quanh, rồi tải thêm khi bạn xem tới (xem [Tải trang và bảo vệ tài khoản](#tải-trang-và-bảo-vệ-tài-khoản)). Ảnh/video hiện theo đúng thứ tự bài viết. Bấm ảnh/video trong bài viết vẫn hoạt động như bình thường của diễn đàn.

Trong modal có 3 kiểu xem:

- **Xem** (mặc định): ảnh lớn ở giữa, dải ảnh thu nhỏ ở dưới để nhảy nhanh tới ảnh khác.
  - Chuyển ảnh: phím ← →, nút ‹ › (nằm hai bên ảnh trên máy tính, ở hai đầu dải ảnh thu nhỏ trên điện thoại, nên không bao giờ che ảnh), hoặc vuốt ngang trên điện thoại. Nút |« »| (hoặc phím **Home** / **End**) về mục đầu tiên / cuối cùng.
  - Dải ảnh luôn giữ mục đang xem ở giữa và có vạch chia trang ("Tr. 2"); thanh công cụ cho biết mục thuộc trang nào ("Trang 2/3"). Kéo dải ảnh bằng chuột (hoặc lăn chuột) để cuộn; bấm bình thường vẫn mở ảnh đó.
  - Nút **lọc** cạnh số thứ tự (Tất cả / Ảnh / Video, kèm số lượng): chuyển ảnh, tự động phát, dải ảnh và chế độ Lưới / Cuộn chỉ tính loại đã chọn.
  - Thanh công cụ hiện số thứ tự kèm một dòng nhỏ bên dưới (trang, mục hỏng, tiến độ tải). Cửa sổ hẹp hơn khoảng 960 px và điện thoại dùng 2 hàng: số thứ tự, nút lọc và nút đóng ở trên, các công cụ có tên ở dưới.
  - Ảnh thu nhỏ chỉ tải khi hiện trên màn hình, tối đa 4 ảnh cùng lúc, nên ảnh bạn mở không phải chờ sau chúng. Trong lúc ảnh lớn đang tải, ảnh thu nhỏ (nếu đã có) hiện mờ kèm vòng xoay; sau đó ảnh kế trước / kế sau được tải trước lần lượt từng ảnh. Ảnh lớn đã tải xong cũng được dùng luôn cho ô thu nhỏ của nó, không tốn thêm yêu cầu.
  - **Cỡ ảnh:** với Imgur và các dịch vụ Chevereto (anh.moe, ibb.co…), dải ảnh dùng bản nhỏ và chế độ Lưới dùng bản vừa của dịch vụ. Nếu sau 0,8 giây ảnh gốc vẫn đang tải, bản vừa được hiện tạm (ảnh gốc tải nhanh thì không gọi bản vừa). Dịch vụ khác chỉ có một file nên vẫn dùng cách hiện ảnh thu nhỏ mờ.
  - **Chất lượng video:** Streamable và RedGifs có bản nhẹ hơn. Bản này được dùng khi mạng chậm (3G trở xuống) hoặc bật tiết kiệm dữ liệu, với host script đã đo được là chậm, và cho ảnh thu nhỏ; còn lại phát bản chất lượng đầy đủ. Nút **Auto / HD / SD** trên thanh điều khiển video cho phép tự chọn (được ghi nhớ), giữ nguyên vị trí đang phát. Nếu video trực tiếp không phát được thì chuyển sang trình phát nhúng của dịch vụ.
  - **Video nhanh hơn:** xem [Tải video](#tải-video).
  - **Máy chủ chậm:** ảnh hoặc video sau 5 giây vẫn chưa tải xong thì hiện thông báo máy chủ phản hồi chậm, kèm nút **Thử lại** và **Mở link gốc**. Yêu cầu tải trang chủ đề được huỷ sau 20 giây và thử lại tối đa 3 lần; trang vẫn lỗi thì được tính là lỗi và các trang sau vẫn tải tiếp. Ảnh thu nhỏ tải chậm nhường chỗ trong hàng đợi cho ảnh kế tiếp sau 10 giây (vẫn tiếp tục tải ngầm).
  - Mục mở đầu được chọn khi trang đang đọc xử lý xong (tối đa khoảng 1,5 giây), nên không bị nhảy khi một link ở đầu trang xử lý xong muộn.
  - Phóng to: bấm chuột trái vào ảnh (bấm lần nữa để thu lại), lăn chuột, hoặc chụm hai ngón. Khi đang phóng to thì kéo để di chuyển. Chuột phải vẫn mở menu bình thường (lưu ảnh, sao chép…), không phóng to.
  - **Tự động phát** (phím Space), **mặc định bật**: ảnh tự chuyển 3,5 giây sau khi đã tải xong; video thì chờ phát xong. Mục nào sau 15 giây vẫn chưa tải xong thì được bỏ qua (không bị đánh dấu hỏng, vẫn quay lại xem được). Nút hiện ▶ khi tắt và biểu tượng tạm dừng khi bật; lựa chọn được ghi nhớ.
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
- **Dừng tải**: bỏ các trang còn đang chờ tải. Nút chỉ hiện khi đang tải.
- **Thông tin người đăng (kiểu Reels)**, trên cả ảnh lẫn video:
  - Góc trên trái luôn hiện nhãn **Tác giả chủ đề** (chủ thớt, màu xanh) hoặc **Thành viên**.
  - Phần thông tin ở mép dưới gồm ảnh đại diện, tên, ngày đăng, vị trí của mục trong bài ("2/5 trong bài") và nội dung (gọn 2 dòng, *Xem thêm* để đọc hết), trên lớp phủ mờ nhạt để không che nhiều.
  - **Video:** thông tin hiện cùng các nút điều khiển (xem ở trên).
  - **Ảnh, trên máy tính:** di chuột vào ảnh thì hiện, chuột ra ngoài thì ẩn.
  - **Ảnh, trên điện thoại:** luôn hiện một dòng thu gọn (tên + một dòng nội dung); chạm vào để mở rộng.
  - **Bài có nhiều ảnh/video:** mỗi mục hiện đoạn chữ nằm sát nó thay vì cả bài. Nếu bài mở đầu bằng chữ, tiêu đề được hiểu là nằm trên ảnh (ảnh không có chữ riêng dùng chung tiêu đề phía trên); nếu bài mở đầu bằng ảnh và kết thúc bằng chữ, tiêu đề được hiểu là nằm dưới ảnh. *Xem cả bài* để đọc toàn bộ nội dung. Bài chỉ có một mục thì hiện cả bài.
  - Nội dung đã bỏ phần trích dẫn, link trần và chữ của link ảnh/video.
  - Khi ảnh hoặc video còn đang tải, thông tin và nhãn được ẩn (chỉ hiện vòng xoay) để không vướng thao tác.
  - Phím **I** bật/tắt thông tin của loại đang xem (ảnh hoặc video). Khi đang phóng to ảnh, nhãn và thông tin tự ẩn.
  - Thông tin ảnh hiện khi di chuột vào ảnh, và vẫn hiện ở ảnh tiếp theo nếu chuột chưa rời đi. Phím **P** (hoặc nút ghim trên phần thông tin) giữ thông tin luôn hiện ở mọi ảnh: khi đó thông tin nằm cạnh ảnh (bên dưới, hoặc bên phải với ảnh dọc, thu nhỏ ảnh một chút nếu không đủ chỗ) nên không bao giờ che ảnh; di chuột vào để đọc đầy đủ.
  - Ở chế độ Cuộn, thông tin hiện thành thẻ phía trên mục; ở chế độ Lưới, tên người đăng hiện ở góc ô video.
  - Tác giả chủ đề được lấy từ dòng thông tin đầu chủ đề, hoặc từ người viết bài đầu tiên của trang 1.
- **Tuỳ chọn** (biểu tượng hai thanh trượt):
  - *Hiện thông tin trên video* / *Hiện thông tin trên ảnh*: hai công tắc riêng, mặc định đều bật.
  - *Hiện mục hỏng*: mặc định ảnh/video đã bị xoá được ẩn đi; bật để thấy chúng trong chế độ Lưới / Cuộn và mở link nguồn.
  - *Sửa danh sách dịch vụ ảnh*: tên miền mà link trỏ tới *trang xem ảnh* (chứ không phải file ảnh). Script mở trang đó ngầm để lấy file thật. Mục không có dấu chấm (vd `zpic`) khớp mọi tên miền chứa chuỗi đó. Gặp dịch vụ mới thì thêm vào đây.
  - *Tải lại chủ đề này (bỏ qua bộ nhớ đệm)*: tải lại mọi trang và mọi link, dùng khi bài ở các trang cũ đã bị sửa hoặc xoá.
- Đóng modal: nút ✕, phím Esc, hoặc bấm ra vùng tối bên ngoài. Mở lại sẽ quay về đúng chỗ đang xem, không phải tải lại.

### Tải trang và bảo vệ tài khoản

Mỗi trang script tải là một yêu cầu gửi tới diễn đàn. Tải liền hàng trăm trang dễ bị coi là bot, và diễn đàn có thể đáp lại bằng captcha, chặn tạm thời, thậm chí khoá tài khoản. Vì vậy script chỉ tải những gì bạn sắp xem, và rất dè dặt với phần còn lại.

**Chế độ tải** (*Tuỳ chọn → Tải trang*, nhớ riêng cho từng diễn đàn):

| Chế độ | Tải những gì |
|---|---|
| **Tiết kiệm** | Chỉ trang đang đọc. Trang kế tiếp được tải khi bạn xem tới mép (mục tiếp theo, đầu / cuối, hoặc bấm vào ô chưa tải). |
| **Cân bằng** (mặc định) | Trang đang đọc và 2 trang mỗi bên. Cửa sổ này đi theo bạn khi xem. |
| **Toàn bộ chủ đề** | Mọi trang. Trên 50 trang thì hỏi trước, kèm thời gian ước tính. |

- Các trang chưa tải hiện thành ô viền đứt **"Tr. 4–8 · chưa tải"** trong dải ảnh và trong lưới; bấm vào để tải trang gần nhất và nhảy tới đó. Trang lỗi hiện **"lỗi, bấm để thử lại"**.
- Tiếp / trước, đầu / cuối và tự động phát vẫn chạy qua được các trang chưa tải: script tải trang đó rồi mới chuyển (giữa màn hình hiện "Đang tải trang 9…").
- Ở kiểu xem Lưới và Cuộn (trừ chế độ Tiết kiệm), cuộn xuống tới ô chưa tải sẽ tải trang tiếp theo, như danh sách cuộn vô tận.

**Cách giãn yêu cầu:**

- Mỗi diễn đàn chỉ một yêu cầu trang tại một thời điểm, **cách nhau khoảng 5 giây** (± 1 giây ngẫu nhiên), dùng chung cho mọi tab đang mở diễn đàn đó. Khoảng cách tự gấp đôi (tối đa 60 giây) khi diễn đàn chậm hoặc lỗi, rồi giảm dần lại.
- Tối đa **40 trang trong 10 phút**; sau đó tạm dừng cho tới khi bạn bấm **Tiếp tục**.
- Nếu diễn đàn đáp yêu cầu tải ngầm bằng **captcha / kiểm tra bảo mật** (hoặc lỗi 403 / 503), script không bao giờ thử lại: diễn đàn đó chuyển sang **chế độ duyệt** (bên dưới), ở mọi tab, trong một ngày.
- Nếu diễn đàn trả **429 Too Many Requests**, script đợi đúng thời gian diễn đàn yêu cầu, lần sau đợi gấp đôi, và dừng hẳn ở lần thứ ba liên tiếp.
- Không tải gì khi tab đang ở chế độ nền hoặc album đang đóng.
- Trang đã có thì không bao giờ tải lại (xem bộ nhớ đệm bên dưới), và trang đang đọc không tốn yêu cầu nào.

Dòng trạng thái dưới bộ đếm cho biết script đang làm gì: số trang đã tải ("12/500 trang"), "đang chờ (giãn cách yêu cầu)", "đang tải trang 9", "đã dừng", "chế độ duyệt".

**Chế độ duyệt** (diễn đàn không cho tải trang ngầm, như voz.vn sau Cloudflare):

- Album gom ảnh từ các trang bạn tự mở; mỗi trang được lưu một tuần, nên chủ đề bạn theo dõi sẽ đầy dần khi đọc.
- Đi tới trang chưa tải (bấm tiếp ở cuối trang, bấm lùi ở đầu trang, đầu / cuối, bấm ô "chưa tải", tự động phát hết trang) sẽ **mở trang đó như bình thường**, giống bấm "Trang sau". Album tự mở lại ở đó, đúng mục đang hướng tới. Các lượt mở trang này được giãn và tính như yêu cầu tải ngầm (cách nhau 5 giây, tối đa 40 lượt mỗi 10 phút).
- Nếu diễn đàn hiện captcha ở trang đó, bạn xác minh như bình thường; album vẫn tự mở lại nếu trang tải xong trong vòng 10 phút.
- Thông báo giải thích hiện một lần cho mỗi diễn đàn. **Thử tải ngầm lại** để thoát chế độ duyệt.

**Album mở ở đâu:**

- Ở trang đang đọc, tại mục đầu tiên, hoặc tại mục bạn đang xem dở trên trang đó.
- Từ link tới một bài (`#post-123`, cũng là chỗ link **chưa đọc** của XenForo đưa tới): tại mục đầu tiên từ bài đó trở đi.
- Nếu lần trước bạn đã xem xa hơn trong chủ đề (trong vòng một tuần), thanh thông báo hỏi **"Lần trước bạn xem tới trang 812. Xem tiếp từ đó"**: bấm một lần là mở trang đó (hoặc nhảy tới nếu đã có trong bộ nhớ đệm), đúng mục đang xem dở.

### Tải video

Host video (Streamable, RedGifs…) không phải diễn đàn: yêu cầu tới đó không tính vào diễn đàn và không thể làm tài khoản diễn đàn bị khoá. Host lớn phát video qua CDN được thiết kế cho lượng truy cập rất lớn. Script vẫn giữ vài giới hạn để không dồn tải vào host nhỏ và để IP của bạn không bị host chặn.

- **Nhớ tốc độ từng host:** thời gian tới khung hình đầu của mỗi host video được ghi nhớ. Host chậm (trên 3 giây) sẽ bắt đầu bằng bản nhẹ.
- **Đua tới khung hình đầu:** nếu bản chất lượng đầy đủ sau 1,5 giây vẫn chưa có hình, bản nhẹ được tải song song; bản nào lên hình trước thì giữ, bản kia bị huỷ. Host thua cuộc đua được ghi nhớ là chậm.
- **Chuẩn bị sẵn video kế tiếp:** khi mục hiện tại đã hiện, video kế tiếp bắt đầu tải ngầm và được đưa lên màn hình khi bạn tới, nên phát gần như ngay. Chỉ một video, chỉ phần đầu, huỷ khi bạn chuyển đi chỗ khác, không chạy khi bật tiết kiệm dữ liệu.
- **Tải song song clip ngắn ở host chậm:** clip tới 30 MB trên host đã biết là chậm được tải thành 3 phần cùng lúc (có ích khi host giới hạn tốc độ từng kết nối), rồi mới phát.
- **Ưu tiên video đang xem:** ảnh bìa dạng video (khi không có ảnh bìa sẵn) tải từng cái một, chỉ sau khi video đang xem đã lên hình. Rời một video thì video đó ngừng tải.
- **Mở kết nối sớm:** kết nối tới host của mục kế tiếp (video và trình phát nhúng) được mở trước.
- **Giới hạn:** host trả lỗi 403 / 429 / 503 sẽ không bị đua hay tải song song trong 30 phút, chỉ phát bình thường. Video tải thẳng lên diễn đàn (tệp đính kèm, proxy của diễn đàn) không bao giờ được chuẩn bị trước, đua hay tải song song.

Trình phát nhúng (YouTube, Vimeo, TikTok) phát trong trình phát của chính dịch vụ, nên script không thể tăng tốc bản thân video, chỉ mở kết nối sớm.

### Bộ nhớ đệm và chuyển trang

Chuyển từ trang 1 sang trang 2 của chủ đề là tải lại cả trang web, nên script khởi động lại từ đầu. Để không phải tải lại cả chủ đề mỗi lần như vậy, script lưu bộ nhớ đệm trong trình duyệt (IndexedDB, chỉ nằm trên máy bạn):

| Dữ liệu | Giữ trong |
|---|---|
| Ảnh/video và thông tin người đăng của từng trang | 7 ngày (3 trang cuối của chủ đề: 1 giờ, vì bài mới nằm ở đó) |
| Kết quả lấy file thật từ link dịch vụ ảnh | 7 ngày (link hỏng: 1 ngày) |
| Ảnh thu nhỏ video do script tìm được | 7 ngày |
| Mục bạn đang xem | 7 ngày |

Khi mở album:

- Trang đang đọc được đọc thẳng từ trang web: không tốn yêu cầu nào, luôn mới nhất.
- Các trang khác lấy từ bộ nhớ đệm nếu còn mới; dòng trạng thái cho biết bao nhiêu trang ("3 trang từ bộ nhớ đệm").
- Các trang cuối được tải lại sau một giờ, vì bài mới nằm ở đó.
- Chỉ những link chưa có trong bộ nhớ đệm mới phải hỏi dịch vụ ảnh.
- Album mở ở **ảnh/video đầu tiên của trang đang đọc** (hoặc của bài được link tới). Nếu trước đó bạn đang xem dở một mục thuộc trang này, album mở đúng mục đó. Mục đang xem được nhớ trong một tuần.

Bộ nhớ đệm giữ 30 chủ đề xem gần nhất và tự xoá mục hết hạn mỗi ngày một lần. Muốn làm mới toàn bộ, dùng *Tải lại chủ đề này* trong **Tuỳ chọn**.

## Những gì script nhận ra

| Loại | Cách xử lý |
|---|---|
| Ảnh/video tải lên diễn đàn (`/attachments/`) | Lấy bản đầy đủ thay vì ảnh thu nhỏ |
| Ảnh đã nhúng `[IMG]`, ảnh tải chậm, ảnh qua proxy của diễn đàn | Lấy link gốc, dự phòng bằng bản proxy (bản này đôi khi còn khi ảnh gốc đã bị xoá) |
| Link thẳng tới `.jpg .png .gif .webp .mp4 .webm …` | Hiện trực tiếp |
| anh.moe, ibb.co, zpic… (Chevereto) | Mở trang lấy ảnh gốc, bỏ đuôi `.md` / `.th` để ra ảnh kích thước đầy đủ; link album thì lấy cả album |
| Streamable | Lấy file mp4 qua API (phát hiện được video đã xoá), không lấy được thì dùng trình phát nhúng |
| RedGifs | Phát thẳng file MP4 qua API (HD, hoặc SD khi mạng chậm); không được thì dùng trình phát nhúng |
| Imgur, YouTube, Vimeo, TikTok | Ảnh trực tiếp hoặc trình phát nhúng |
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
- Script không giải captcha của diễn đàn hộ bạn (cố ý như vậy): script dừng lại và chờ bạn xác minh trong tab thường.

## Ủng hộ

XenForo Thread Gallery miễn phí và mã nguồn mở, do Dylan Phan làm. Nếu nó giúp bạn bớt phải cuộn qua hàng chục trang, bạn có thể mời mình một ly cà phê trên Ko-fi để mình tiếp tục cải thiện.

[![Ủng hộ trên Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/dylanphan)
