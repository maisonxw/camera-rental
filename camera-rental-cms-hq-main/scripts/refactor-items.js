const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../components/item-management.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Rename interfaces, components, variables
content = content.replace(/interface Camera \{/g, 'interface Item {');
content = content.replace(/CameraFormProps/g, 'ItemFormProps');
content = content.replace(/CameraForm/g, 'ItemForm');
content = content.replace(/CameraManagement/g, 'ItemManagement');
content = content.replace(/CameraIcon/g, 'ItemIcon');
content = content.replace(/<Camera /g, '<Package '); // Lucide icon
content = content.replace(/<Camera\b/g, '<Package'); 
content = content.replace(/cameras/g, 'items');
content = content.replace(/setCameras/g, 'setItems');
content = content.replace(/camera: /g, 'item: ');
content = content.replace(/camera\./g, 'item.');
content = content.replace(/camera\?/g, 'item?');
content = content.replace(/editingCamera/g, 'editingItem');
content = content.replace(/setEditingCamera/g, 'setEditingItem');
content = content.replace(/handleAddCamera/g, 'handleAddItem');
content = content.replace(/handleEditCamera/g, 'handleEditItem');
content = content.replace(/handleDeleteCamera/g, 'handleDeleteItem');

// Text replacements
content = content.replace(/máy ảnh/g, 'thiết bị');
content = content.replace(/Máy ảnh/g, 'Thiết bị');
content = content.replace(/Máy Ảnh/g, 'Thiết bị');
content = content.replace(/CAMERA_CATEGORIES/g, 'ITEM_CATEGORIES');

// Replace categories list
const oldCats = `const ITEM_CATEGORIES = [
  "DSLR",
  "Mirrorless",
  "Film Camera",
  "Action Camera",
  "Instant Camera",
  "Medium Format",
  "Large Format",
]`;

const newCats = `const ITEM_CATEGORIES = [
  "Camera - DSLR",
  "Camera - Mirrorless",
  "Camera - Film",
  "Camera - Action",
  "Ống kính (Lens)",
  "Ánh sáng (Đèn flash, Đèn led)",
  "Âm thanh (Mic, Mixer)",
  "Phụ kiện (Tripod, Gimbal)",
  "Thiết bị khác"
]`;
content = content.replace(oldCats, newCats);

// 2. Refactor Supabase calls to fetch
// Remove supabase import
content = content.replace(/import \{ supabase \} from "@\/lib\/supabase"\n/g, '');

// Update loadCameras -> loadItems logic
const oldLoadItems = `    const loadItems = async () => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) {
          // Map snake_case từ DB sang camelCase
          const mapped = data.map((c: any) => ({
            ...c,
            mainImage: c.main_image || "",
          }))
          setItems(mapped as Item[])
        }
      } catch (error) {`;

const newLoadItems = `    const loadItems = async () => {
      try {
        const res = await fetch('/api/items')
        if (!res.ok) throw new Error('Failed to fetch items')
        const data = await res.json()
        
        if (data) {
          // Map snake_case từ DB sang camelCase
          const mapped = data.map((c: any) => ({
            ...c,
            mainImage: c.main_image || "",
          }))
          setItems(mapped as Item[])
        }
      } catch (error) {`;

content = content.replace(oldLoadItems, newLoadItems);

// Update handleAddItem logic
const oldHandleAddItem = `      const { error } = await supabase
        .from('items')
        .insert([payload])

      if (error) {
        console.error("Supabase error chi tiết:", JSON.stringify(error))
        throw error
      }

      toast({ title: "Thành công", description: "Đã thêm thiết bị mới" })

      // Reload list
      const { data: updatedList } = await supabase.from('items').select('*').order('created_at', { ascending: false })
      if (updatedList) {
        const mapped = updatedList.map((c: any) => ({ ...c, mainImage: c.main_image || "" }))
        setItems(mapped as Item[])
      }`;

const newHandleAddItem = `      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Lỗi server')
      }

      toast({ title: "Thành công", description: "Đã thêm thiết bị mới" })
      loadItems() // Reload list`;
      
content = content.replace(oldHandleAddItem, newHandleAddItem);
content = content.replace(/loadItems\(\)\n    \}/, "loadItems()\n    }"); // just checking...
// wait, loadItems is defined inside useEffect in the original file! 
// Let's modify the component to move `loadItems` outside or just duplicate the fetch for reloading.

const oldHandleAddItemFull = `  const handleAddItem = async (data: Omit<Item, "id">) => {
    try {
      // Tách mainImage ra — chỉ gửi khi cột tồn tại trong DB
      const { mainImage, ...rest } = data as any
      const payload = mainImage ? { ...rest, main_image: mainImage } : rest

      const { error } = await supabase
        .from('items')
        .insert([payload])

      if (error) {
        console.error("Supabase error chi tiết:", JSON.stringify(error))
        throw error
      }

      toast({ title: "Thành công", description: "Đã thêm thiết bị mới" })

      // Reload list
      const { data: updatedList } = await supabase.from('items').select('*').order('created_at', { ascending: false })
      if (updatedList) {
        const mapped = updatedList.map((c: any) => ({ ...c, mainImage: c.main_image || "" }))
        setItems(mapped as Item[])
      }

      setIsAddDialogOpen(false)
    } catch (error: any) {`;

const newHandleAddItemFull = `  // Function to refresh list
  const refreshItems = async () => {
    try {
      const res = await fetch('/api/items')
      if (res.ok) {
        const data = await res.json()
        const mapped = data.map((c: any) => ({ ...c, mainImage: c.main_image || "" }))
        setItems(mapped as Item[])
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddItem = async (data: Omit<Item, "id">) => {
    try {
      // Tách mainImage ra — chỉ gửi khi cột tồn tại trong DB
      const { mainImage, ...rest } = data as any
      const payload = mainImage ? { ...rest, main_image: mainImage } : rest

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Thêm thất bại')
      }

      toast({ title: "Thành công", description: "Đã thêm thiết bị mới" })
      refreshItems()
      setIsAddDialogOpen(false)
    } catch (error: any) {`;

content = content.replace(oldHandleAddItemFull, newHandleAddItemFull);


// Update handleEditItem
const oldHandleEditItemFull = `  const handleEditItem = async (data: Omit<Item, "id">) => {
    if (!editingItem) return
    try {
      // Tách mainImage ra — map sang tên cột Supabase
      const { mainImage, ...rest } = data as any
      const payload = mainImage !== undefined ? { ...rest, main_image: mainImage } : rest

      const { error } = await supabase
        .from('items')
        .update(payload)
        .eq('id', editingItem.id)

      if (error) {
        console.error("Supabase error chi tiết:", JSON.stringify(error))
        throw error
      }

      toast({ title: "Thành công", description: "Đã cập nhật thông tin" })

      // Refresh list
      const { data: updatedList } = await supabase.from('items').select('*').order('created_at', { ascending: false })
      if (updatedList) {
        const mapped = updatedList.map((c: any) => ({ ...c, mainImage: c.main_image || "" }))
        setItems(mapped as Item[])
      }

      setEditingItem(null)
    } catch (error: any) {`;

const newHandleEditItemFull = `  const handleEditItem = async (data: Omit<Item, "id">) => {
    if (!editingItem) return
    try {
      // Tách mainImage ra — map sang tên cột Supabase
      const { mainImage, ...rest } = data as any
      const payload = mainImage !== undefined ? { ...rest, main_image: mainImage } : rest

      const res = await fetch(\`/api/items/\${editingItem.id}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Cập nhật thất bại')
      }

      toast({ title: "Thành công", description: "Đã cập nhật thông tin" })
      refreshItems()
      setEditingItem(null)
    } catch (error: any) {`;

content = content.replace(oldHandleEditItemFull, newHandleEditItemFull);

// Update handleDeleteItem
const oldHandleDeleteItem = `  const handleDeleteItem = async (id: string) => {
    if (!confirm("Xóa thiết bị này vĩnh viễn?")) return
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({ title: "Thành công", description: "Đã xóa thiết bị" })
      setItems(items.filter(c => c.id !== id))
    } catch (error) {`;

const newHandleDeleteItem = `  const handleDeleteItem = async (id: string) => {
    if (!confirm("Xóa thiết bị này vĩnh viễn?")) return
    try {
      const res = await fetch(\`/api/items/\${id}\`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Xóa thất bại')
      }

      toast({ title: "Thành công", description: "Đã xóa thiết bị" })
      setItems(items.filter(c => c.id !== id))
    } catch (error) {`;

content = content.replace(oldHandleDeleteItem, newHandleDeleteItem);


fs.writeFileSync(filePath, content, 'utf-8');
console.log('Refactor completed.');
