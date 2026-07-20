$body = @{
    email = "testsave@gmail.com"
    password = "12345678"
} | ConvertTo-Json

Write-Host "1. Logging in..."
$loginRes = Invoke-RestMethod -Uri "http://localhost:9999/api/v1/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $loginRes.accessToken
Write-Host "Token obtained: $token"

Write-Host "2. Getting profile..."
$headers = @{
    Authorization = "Bearer $token"
}
$profile = Invoke-RestMethod -Uri "http://localhost:9999/api/v1/users/profile" -Method Get -Headers $headers
Write-Host "Profile retrieved successfully. Name: $($profile.candidateProfile.fullName)"

Write-Host "3. Updating profile..."
$updateBody = @{
    phone = "0987654321"
    fullName = "Test Save Updated"
    preferredLocation = "Hanoi"
} | ConvertTo-Json

try {
    $updateRes = Invoke-WebRequest -Uri "http://localhost:9999/api/v1/users/profile" -Method Put -Headers $headers -Body $updateBody -ContentType "application/json"
    Write-Host "Update success!"
    Write-Host $updateRes.Content
} catch {
    Write-Host "Update failed!"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $resp = $reader.ReadToEnd()
        Write-Host "Response: $resp"
    }
}
