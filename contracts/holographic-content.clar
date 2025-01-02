;; Holographic Content Management Contract

(define-map content
  { content-id: uint }
  {
    creator: principal,
    title: (string-utf8 100),
    description: (string-utf8 1000),
    content-hash: (buff 32),
    creation-date: uint,
    content-type: (string-ascii 20),
    duration: uint,
    is-published: bool
  }
)

(define-map content-rights
  { content-id: uint }
  {
    owner: principal,
    license-type: (string-ascii 20),
    royalty-percentage: uint,
    expiration-date: (optional uint)
  }
)

(define-data-var content-count uint u0)

(define-public (create-content (title (string-utf8 100)) (description (string-utf8 1000)) (content-hash (buff 32)) (content-type (string-ascii 20)) (duration uint))
  (let
    (
      (new-content-id (+ (var-get content-count) u1))
    )
    (map-set content
      { content-id: new-content-id }
      {
        creator: tx-sender,
        title: title,
        description: description,
        content-hash: content-hash,
        creation-date: block-height,
        content-type: content-type,
        duration: duration,
        is-published: false
      }
    )
    (map-set content-rights
      { content-id: new-content-id }
      {
        owner: tx-sender,
        license-type: "exclusive",
        royalty-percentage: u0,
        expiration-date: none
      }
    )
    (var-set content-count new-content-id)
    (ok new-content-id)
  )
)

(define-public (publish-content (content-id uint))
  (let
    (
      (content-data (unwrap! (map-get? content { content-id: content-id }) (err u404)))
    )
    (asserts! (is-eq (get creator content-data) tx-sender) (err u403))
    (ok (map-set content
      { content-id: content-id }
      (merge content-data { is-published: true })
    ))
  )
)

(define-public (transfer-rights (content-id uint) (new-owner principal) (license-type (string-ascii 20)) (royalty-percentage uint) (expiration-date (optional uint)))
  (let
    (
      (rights (unwrap! (map-get? content-rights { content-id: content-id }) (err u404)))
    )
    (asserts! (is-eq (get owner rights) tx-sender) (err u403))
    (ok (map-set content-rights
      { content-id: content-id }
      {
        owner: new-owner,
        license-type: license-type,
        royalty-percentage: royalty-percentage,
        expiration-date: expiration-date
      }
    ))
  )
)

(define-read-only (get-content (content-id uint))
  (ok (map-get? content { content-id: content-id }))
)

(define-read-only (get-content-rights (content-id uint))
  (ok (map-get? content-rights { content-id: content-id }))
)

(define-read-only (get-content-count)
  (ok (var-get content-count))
)

